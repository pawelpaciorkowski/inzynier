from app.database import db
from datetime import datetime

class Tag(db.Model):
    __tablename__ = 'Tags'
    
    Id = db.Column(db.Integer, primary_key=True)
    Name = db.Column(db.String(100), nullable=False)
    Color = db.Column(db.String(7), default='#007bff')
    Description = db.Column(db.Text)
    
    def to_dict(self):
        return {
            'id': self.Id,
            'name': self.Name,
            'color': self.Color,
            'description': self.Description
        }
