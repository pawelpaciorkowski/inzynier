from app.database import db
from datetime import datetime

class CalendarEvent(db.Model):
    __tablename__ = 'CalendarEvents'
    
    Id = db.Column(db.Integer, primary_key=True)
    Title = db.Column(db.String(255), nullable=False)
    Start = db.Column(db.DateTime, nullable=False)
    End = db.Column(db.DateTime, nullable=False)
    
    def to_dict(self):
        return {
            'id': self.Id,
            'title': self.Title,
            'start': self.Start.isoformat() if self.Start else None,
            'end': self.End.isoformat() if self.End else None,
            'startTime': self.Start.isoformat() if self.Start else None,  # Alias dla kompatybilności
            'endTime': self.End.isoformat() if self.End else None  # Alias dla kompatybilności
        }
