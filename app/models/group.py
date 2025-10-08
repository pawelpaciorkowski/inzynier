from app.database import db
from datetime import datetime

class Group(db.Model):
    __tablename__ = 'Groups'
    
    Id = db.Column(db.Integer, primary_key=True)
    Name = db.Column(db.String(255), nullable=False)
    Description = db.Column(db.Text)
    
    def to_dict(self):
        return {
            'id': self.Id,
            'name': self.Name,
            'description': self.Description
        }
