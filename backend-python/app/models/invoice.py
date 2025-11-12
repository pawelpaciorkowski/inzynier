from app.database import db
from datetime import datetime

# Tabela pomocnicza dla relacji many-to-many między fakturami a tagami
invoice_tags = db.Table('InvoiceTags',
    db.Column('InvoiceId', db.Integer, db.ForeignKey('Invoices.Id'), primary_key=True),
    db.Column('TagId', db.Integer, db.ForeignKey('Tags.Id'), primary_key=True)
)

class Invoice(db.Model):
    __tablename__ = 'Invoices'
    
    Id = db.Column(db.Integer, primary_key=True)
    Number = db.Column(db.String(100), nullable=False)
    CustomerId = db.Column(db.Integer, db.ForeignKey('Customers.Id'), nullable=False)
    IssuedAt = db.Column(db.DateTime)
    DueDate = db.Column(db.DateTime)
    IsPaid = db.Column(db.Boolean, default=False)
    TotalAmount = db.Column(db.Numeric(65, 30))
    AssignedGroupId = db.Column(db.Integer)
    CreatedByUserId = db.Column(db.Integer)
    
    customer = db.relationship('Customer', backref='invoices')
    # Relacja many-to-many z tagami
    tags = db.relationship('Tag', secondary=invoice_tags, backref='invoices')
    
    def to_dict(self, include_items=False):
        # Oblicz kwoty netto i podatku (23% VAT)
        total_amount = float(self.TotalAmount) if self.TotalAmount else 0
        net_amount = total_amount / 1.23 if total_amount > 0 else 0  # Kwota netto (bez VAT)
        tax_amount = total_amount - net_amount  # Kwota podatku VAT
        
        result = {
            'id': self.Id,
            'number': self.Number,
            'invoiceNumber': self.Number,  # Alias dla kompatybilności z frontendem
            'customerId': self.CustomerId,
            'customerName': self.customer.Name if self.customer else 'Nieznany klient',  # Dodaj nazwę klienta
            'issuedAt': self.IssuedAt.isoformat() if self.IssuedAt else None,
            'dueDate': self.DueDate.isoformat() if self.DueDate else None,
            'isPaid': self.IsPaid,
            'status': 'Paid' if self.IsPaid else 'Pending',  # Mapowanie boolean na string
            'amount': total_amount,
            'totalAmount': total_amount,
            'netAmount': net_amount,  # Kwota netto
            'taxAmount': tax_amount,  # Kwota podatku VAT
            'assignedGroupId': self.AssignedGroupId,
            'createdByUserId': self.CreatedByUserId
        }

        # Dodaj pozycje faktury jeśli requested
        if include_items:
            result['items'] = [item.to_dict() for item in self.invoice_items]

        return result
