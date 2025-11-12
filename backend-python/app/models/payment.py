from app.database import db
from datetime import datetime

class Payment(db.Model):
    __tablename__ = 'Payments'
    
    Id = db.Column(db.Integer, primary_key=True)
    InvoiceId = db.Column(db.Integer, db.ForeignKey('Invoices.Id'), nullable=False)
    PaidAt = db.Column(db.DateTime, nullable=False)
    Amount = db.Column(db.Numeric(65, 30), nullable=False)
    
    invoice = db.relationship('Invoice', backref='payments')
    
    def to_dict(self):
        return {
            'id': self.Id,
            'invoiceId': self.InvoiceId,
            'invoiceNumber': self.invoice.Number if self.invoice else None,
            'paidAt': self.PaidAt.isoformat() if self.PaidAt else None,
            'paymentDate': self.PaidAt.isoformat() if self.PaidAt else None,  # Alias dla kompatybilności
            'amount': float(self.Amount) if self.Amount else None,
            'method': 'Transfer',  # Domyślna wartość
            'status': 'Completed',  # Domyślna wartość
            'createdAt': self.PaidAt.isoformat() if self.PaidAt else None  # Alias dla kompatybilności
        }
