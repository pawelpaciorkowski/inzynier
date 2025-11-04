from app.database import db
from datetime import datetime
from app.utils import get_device_info
import pytz # Importuj pytz

class LoginHistory(db.Model):
    __tablename__ = 'LoginHistory'
    
    Id = db.Column(db.Integer, primary_key=True)
    UserId = db.Column(db.Integer, db.ForeignKey('users.id', ondelete='CASCADE'), nullable=False)
    LoginTime = db.Column(db.DateTime, default=lambda: pytz.utc.localize(datetime.utcnow())) 
    IpAddress = db.Column(db.String(45))
    UserAgent = db.Column(db.Text)
    Success = db.Column(db.Boolean, default=True)
    
    # Relacje
    user = db.relationship('User', backref=db.backref('login_history', cascade='all, delete-orphan'))
    
    def to_dict(self):
        # Parsuj informacje o urządzeniu z UserAgent
        device_info = get_device_info(self.UserAgent or '')
        device_parts = device_info.split(' - ')
        
        device_type = device_parts[0] if len(device_parts) > 0 else 'Unknown'
        operating_system = device_parts[1] if len(device_parts) > 1 else 'Unknown'
        browser = device_parts[2] if len(device_parts) > 2 else 'Unknown'
        
        login_time_iso = self.LoginTime.isoformat() if self.LoginTime else None 
        
        return {
            'id': self.Id,
            'userId': self.UserId,
            'loginTime': login_time_iso,
            'ipAddress': self.IpAddress,
            'userAgent': self.UserAgent,
            'deviceType': device_type,
            'operatingSystem': operating_system,
            'browser': browser,
            'success': self.Success
        }