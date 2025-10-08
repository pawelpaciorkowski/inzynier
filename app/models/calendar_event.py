from app.database import db
from datetime import datetime

class CalendarEvent(db.Model):
    __tablename__ = 'CalendarEvents'
    
    Id = db.Column(db.Integer, primary_key=True)
    Title = db.Column(db.String(255), nullable=False)
    Description = db.Column(db.Text, nullable=True)
    Start = db.Column('StartTime', db.DateTime, nullable=False)
    End = db.Column('EndTime', db.DateTime, nullable=False)
    AllDay = db.Column(db.Boolean, default=False)
    UserId = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    CreatedAt = db.Column(db.DateTime, default=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.Id,
            'title': self.Title,
            'description': self.Description,
            'start': self.Start.isoformat() if self.Start else None,
            'end': self.End.isoformat() if self.End else None,
            'allDay': self.AllDay,
            'userId': self.UserId
        }
