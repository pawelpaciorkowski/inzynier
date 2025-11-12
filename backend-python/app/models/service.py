from app.database import db
from datetime import datetime
from decimal import Decimal

class Service(db.Model):
    __tablename__ = 'Services'
    
    Id = db.Column(db.Integer, primary_key=True)
    Name = db.Column(db.String(255), nullable=False)
    Price = db.Column(db.Numeric(65, 30))
    TaxRate = db.Column(db.Numeric(65, 30), default=Decimal('0.23'), nullable=False)
    
    def to_dict(self):
        return {
            'id': self.Id,
            'name': self.Name,
            'price': float(self.Price) if self.Price else None
        }
