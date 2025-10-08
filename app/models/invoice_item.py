from app.database import db
from decimal import Decimal

class InvoiceItem(db.Model):
    """Model reprezentujący pozycję na fakturze (relacja Invoice <-> Service)"""
    __tablename__ = 'InvoiceItems'

    Id = db.Column(db.Integer, primary_key=True)
    InvoiceId = db.Column(db.Integer, db.ForeignKey('Invoices.Id'), nullable=False)
    ServiceId = db.Column(db.Integer, db.ForeignKey('Services.Id'), nullable=False)
    Quantity = db.Column(db.Integer, default=1)
    UnitPrice = db.Column(db.Numeric(65, 30))  # Cena w momencie utworzenia faktury
    Description = db.Column(db.String(255), nullable=True) # Dodana kolumna Description
    TaxRate = db.Column(db.Numeric(65, 30), default=Decimal('0.23'), nullable=False) # Dodana kolumna TaxRate z domyślną wartością 23%
    NetAmount = db.Column(db.Numeric(65, 30), default=Decimal('0.00'), nullable=False) # Dodana kolumna NetAmount
    TaxAmount = db.Column(db.Numeric(65, 30), default=Decimal('0.00'), nullable=False) # Dodana kolumna TaxAmount
    GrossAmount = db.Column(db.Numeric(65, 30), default=Decimal('0.00'), nullable=False) # Dodana kolumna GrossAmount

    # Relacje
    invoice = db.relationship('Invoice', backref='invoice_items')
    service = db.relationship('Service', backref='invoice_items')

    def to_dict(self):
        unit_price = float(self.UnitPrice) if self.UnitPrice else 0
        quantity = self.Quantity or 0
        net_total = unit_price * quantity  # Kwota netto pozycji
        gross_total = net_total * 1.23  # Kwota brutto z VAT (23%)
        
        return {
            'id': self.Id,
            'invoiceId': self.InvoiceId,
            'serviceId': self.ServiceId,
            'serviceName': self.service.Name if self.service else 'Nieznana usługa',
            'description': self.service.Name if self.service else 'Nieznana usługa',  # Alias dla aplikacji mobilnej
            'quantity': quantity,
            'unitPrice': unit_price,
            'netAmount': net_total,  # Kwota netto pozycji
            'grossAmount': gross_total,  # Kwota brutto pozycji (z VAT)
            'totalPrice': gross_total  # Alias dla kompatybilności
        }
