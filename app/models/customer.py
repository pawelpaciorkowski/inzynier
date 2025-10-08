from app.database import db
from datetime import datetime

class Customer(db.Model):
    __tablename__ = 'Customers'
    
    Id = db.Column(db.Integer, primary_key=True)
    Name = db.Column(db.String(255), nullable=False)
    Email = db.Column(db.String(255))
    Phone = db.Column(db.String(50))
    Company = db.Column(db.String(255))
    Address = db.Column(db.Text)
    NIP = db.Column(db.String(50))
    Representative = db.Column(db.String(255))
    CreatedAt = db.Column(db.DateTime, default=datetime.utcnow)
    AssignedGroupId = db.Column(db.Integer)
    AssignedUserId = db.Column(db.Integer)
    
    def to_dict(self):
        return {
            'id': self.Id,
            'name': self.Name,
            'email': self.Email,
            'phone': self.Phone,
            'company': self.Company,
            'address': self.Address,
            'nip': self.NIP,
            'representative': self.Representative,
            'createdAt': self.CreatedAt.isoformat() if self.CreatedAt else None,
            'assignedGroupId': self.AssignedGroupId,
            'assignedUserId': self.AssignedUserId
        }
