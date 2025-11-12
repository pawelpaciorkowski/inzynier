from app.database import db
from datetime import datetime

class Note(db.Model):
    __tablename__ = 'Notes'
    
    Id = db.Column(db.Integer, primary_key=True)
    Content = db.Column(db.Text, nullable=False)
    CreatedAt = db.Column(db.DateTime, default=datetime.utcnow)
    CustomerId = db.Column(db.Integer, db.ForeignKey('Customers.Id'), nullable=False)
    UserId = db.Column(db.Integer, db.ForeignKey('users.id', ondelete='CASCADE'), nullable=False)
    
    customer = db.relationship('Customer', backref='notes')
    user = db.relationship('User', backref=db.backref('notes', cascade='all, delete-orphan'))
    
    def to_dict(self):
        # Zwraca słownik z danymi notatki, w tym nazwą klienta
        return {
            'id': self.Id,
            'content': self.Content,
            'createdAt': self.CreatedAt.isoformat() if self.CreatedAt else None,
            'customerId': self.CustomerId,
            'customerName': self.customer.Name if self.customer else None,  # Dodano nazwę klienta
            'userId': self.UserId
        }
