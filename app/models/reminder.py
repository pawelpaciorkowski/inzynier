from app.database import db
from datetime import datetime

class Reminder(db.Model):
    __tablename__ = 'Reminders'
    
    Id = db.Column(db.Integer, primary_key=True)
    Note = db.Column(db.Text, nullable=False)
    RemindAt = db.Column(db.DateTime, nullable=False)
    UserId = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    
    # Relacje
    user = db.relationship('User', backref='reminders')
    
    def to_dict(self):
        return {
            'id': self.Id,
            'note': self.Note,
            'remind_at': self.RemindAt.isoformat() + 'Z' if self.RemindAt else None,
            'user_id': self.UserId
        }
