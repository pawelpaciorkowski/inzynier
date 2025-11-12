from app.database import db
from datetime import datetime

class Activity(db.Model):
    __tablename__ = 'Activities'
    
    Id = db.Column(db.Integer, primary_key=True)
    Note = db.Column(db.Text, nullable=False)
    CreatedAt = db.Column(db.DateTime, default=datetime.utcnow)
    UserId = db.Column(db.Integer, db.ForeignKey('users.id', ondelete='CASCADE'), nullable=False)
    CustomerId = db.Column(db.Integer, db.ForeignKey('Customers.Id'))
    
    # Relacje
    user = db.relationship('User', backref=db.backref('activities', cascade='all, delete-orphan'))
    customer = db.relationship('Customer', backref='activities')
    
    def to_dict(self):
        return {
            'id': self.Id,
            'note': self.Note,
            'createdAt': self.CreatedAt.isoformat() if self.CreatedAt else None,
            'userId': self.UserId,
            'customerId': self.CustomerId
        }