from app.database import db
from datetime import datetime

class Message(db.Model):
    __tablename__ = 'Messages'
    
    Id = db.Column(db.Integer, primary_key=True)
    Subject = db.Column(db.String(255), nullable=False)
    Body = db.Column(db.Text, nullable=False)
    SenderUserId = db.Column(db.Integer, db.ForeignKey('users.id', ondelete='CASCADE'), nullable=False)
    RecipientUserId = db.Column(db.Integer, db.ForeignKey('users.id', ondelete='CASCADE'), nullable=False)
    SentAt = db.Column(db.DateTime, default=datetime.utcnow)
    IsRead = db.Column(db.Boolean, default=False)
    
    sender = db.relationship('User', foreign_keys=[SenderUserId], backref=db.backref('sent_messages', cascade='all, delete-orphan'))
    recipient = db.relationship('User', foreign_keys=[RecipientUserId], backref=db.backref('received_messages', cascade='all, delete-orphan'))
    
    def to_dict(self):
        """Konwertuje model do słownika z nazwami użytkowników - format zgodny z C# API"""
        from app.models import User
        
        # Pobierz dane nadawcy i odbiorcy
        sender = User.query.get(self.SenderUserId)
        recipient = User.query.get(self.RecipientUserId)
        
        sender_username = sender.username if sender else 'Unknown'
        recipient_username = recipient.username if recipient else 'Unknown'
        
        return {
            'id': self.Id,
            'subject': self.Subject,
            'body': self.Body,
            'senderUserId': self.SenderUserId,
            'senderUsername': sender_username,  # Dodane dla frontendu
            'sender': {
                'id': sender.id if sender else None,
                'username': sender_username,
                'email': sender.email if sender else None
            } if sender else None,
            'recipientUserId': self.RecipientUserId,
            'recipientUsername': recipient_username,  # Dodane dla frontendu
            'recipient': {
                'id': recipient.id if recipient else None,
                'username': recipient_username,
                'email': recipient.email if recipient else None
            } if recipient else None,
            'sentAt': self.SentAt.isoformat() if self.SentAt else None,
            'isRead': self.IsRead
        }
