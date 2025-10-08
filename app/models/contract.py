from app.database import db
from datetime import datetime

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
    
    def to_dict(self):
        return {
            'id': self.Id,
            'title': self.Title,
            'signedAt': self.SignedAt.isoformat() if self.SignedAt else None,
            'customerId': self.CustomerId,
            'contractNumber': self.ContractNumber,
            'placeOfSigning': self.PlaceOfSigning,
            'scopeOfServices': self.ScopeOfServices,
            'startDate': self.StartDate.isoformat() if self.StartDate else None,
            'endDate': self.EndDate.isoformat() if self.EndDate else None,
            'netAmount': float(self.NetAmount) if self.NetAmount else None,
            'paymentTermDays': self.PaymentTermDays,
            'createdByUserId': self.CreatedByUserId,
            'responsibleGroupId': self.ResponsibleGroupId
        }
