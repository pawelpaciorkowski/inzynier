from app.database import db
from datetime import datetime

class SystemLog(db.Model):
    __tablename__ = 'SystemLogs'
    
    Id = db.Column(db.Integer, primary_key=True)
    Level = db.Column(db.String(20), nullable=False)
    Message = db.Column(db.Text, nullable=False)
    Source = db.Column(db.String(255))
    Details = db.Column(db.Text)
    Timestamp = db.Column(db.DateTime, default=datetime.now)
    UserId = db.Column(db.Integer, db.ForeignKey('users.id', ondelete='SET NULL'))
    
    user = db.relationship('User', backref='system_logs')
    
    def to_dict(self):
        return {
            'id': self.Id,
            'level': self.Level,
            'message': self.Message,
            'source': self.Source,
            'details': self.Details,
            'timestamp': self.Timestamp.isoformat() if self.Timestamp else None,
            'userId': self.UserId
        }
