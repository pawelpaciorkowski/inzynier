from app.database import db
from datetime import datetime
from decimal import Decimal

# Tabela pomocnicza dla relacji many-to-many między umowami a tagami
contract_tags = db.Table('ContractTags',
    db.Column('ContractId', db.Integer, db.ForeignKey('Contracts.Id'), primary_key=True),
    db.Column('TagId', db.Integer, db.ForeignKey('Tags.Id'), primary_key=True)
)

# Tabela pomocnicza dla relacji many-to-many między umowami a usługami
contract_services = db.Table('ContractServices',
    db.Column('ContractId', db.Integer, db.ForeignKey('Contracts.Id'), primary_key=True),
    db.Column('ServiceId', db.Integer, db.ForeignKey('Services.Id'), primary_key=True),
    db.Column('Quantity', db.Integer, default=1)  # Ilość danej usługi w kontrakcie
)

class Contract(db.Model):
    __tablename__ = 'Contracts'
    
    Id = db.Column(db.Integer, primary_key=True)
    Title = db.Column(db.String(255), nullable=False)
    SignedAt = db.Column(db.DateTime)
    CustomerId = db.Column(db.Integer, db.ForeignKey('Customers.Id'), nullable=False)
    ContractNumber = db.Column(db.String(100))
    PlaceOfSigning = db.Column(db.String(255))
    ScopeOfServices = db.Column(db.Text)
    StartDate = db.Column(db.DateTime)
    EndDate = db.Column(db.DateTime)
    NetAmount = db.Column(db.Numeric(65, 30))
    PaymentTermDays = db.Column(db.Integer)
    CreatedByUserId = db.Column(db.Integer)
    ResponsibleGroupId = db.Column(db.Integer)
    
    # Relacje
    customer = db.relationship('Customer', backref='contracts')
    # Relacja many-to-many z tagami
    tags = db.relationship('Tag', secondary=contract_tags, backref='contracts')
    # Relacja many-to-many z usługami
    services = db.relationship('Service', secondary=contract_services, backref='contracts', lazy='dynamic')
    
    def to_dict(self):
        # Pobierz usługi przypisane do kontraktu
        services_list = []
        from sqlalchemy import text
        for service in self.services.all():
            # Pobierz ilość z tabeli pomocniczej
            quantity = db.session.execute(
                text("SELECT Quantity FROM ContractServices WHERE ContractId = :contract_id AND ServiceId = :service_id"),
                {'contract_id': self.Id, 'service_id': service.Id}
            ).scalar() or 1
            
            services_list.append({
                'serviceId': service.Id,
                'serviceName': service.Name,
                'price': float(service.Price) if service.Price else 0,
                'quantity': quantity
            })
        
        return {
            'id': self.Id,
            'title': self.Title,
            'signedAt': str(self.SignedAt.date()) if self.SignedAt else None,
            'customerId': self.CustomerId,
            'contractNumber': self.ContractNumber,
            'placeOfSigning': self.PlaceOfSigning,
            'scopeOfServices': self.ScopeOfServices,  # Zachowaj dla kompatybilności wstecznej
            'services': services_list,  # Lista usług z kontraktu
            'serviceIds': [s['serviceId'] for s in services_list],  # Lista ID usług dla łatwiejszego użycia
            'startDate': str(self.StartDate.date()) if self.StartDate else None,
            'endDate': str(self.EndDate.date()) if self.EndDate else None,
            'netAmount': float(self.NetAmount) if self.NetAmount else None,
            'paymentTermDays': self.PaymentTermDays,
            'createdByUserId': self.CreatedByUserId,
            'responsibleGroupId': self.ResponsibleGroupId
        }
