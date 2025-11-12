from app.database import db
from datetime import datetime

class Notification(db.Model):
    __tablename__ = 'Notifications'
    
    Id = db.Column(db.Integer, primary_key=True)
    Message = db.Column(db.Text, nullable=False)
    IsRead = db.Column(db.Boolean, default=False)
    CreatedAt = db.Column(db.DateTime, default=datetime.utcnow)
    UserId = db.Column(db.Integer, db.ForeignKey('users.id', ondelete='CASCADE'), nullable=False)
    
    # Relacje
    user = db.relationship('User', backref=db.backref('notifications', cascade='all, delete-orphan'))
    
    def to_dict(self):
        return {
            'id': self.Id,
            'message': self.Message,
            'isRead': self.IsRead,
            'createdAt': self.CreatedAt.isoformat() if self.CreatedAt else None,
            'userId': self.UserId
        }
