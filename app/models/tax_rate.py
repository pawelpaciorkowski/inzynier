from app.database import db
from datetime import datetime

class TaxRate(db.Model):
    __tablename__ = 'TaxRates'
    
    Id = db.Column(db.Integer, primary_key=True)
    Name = db.Column(db.String(100), nullable=False)
    Rate = db.Column(db.Numeric(5, 2), nullable=False)
    IsActive = db.Column(db.Boolean, default=True)
    CreatedAt = db.Column(db.DateTime, default=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.Id,
            'name': self.Name,
            'rate': float(self.Rate),
            'isActive': self.IsActive,
            'createdAt': self.CreatedAt.isoformat() if self.CreatedAt else None
        }
