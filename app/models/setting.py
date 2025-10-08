from app.database import db

class Setting(db.Model):
    __tablename__ = 'Settings'
    
    Id = db.Column(db.Integer, primary_key=True)
    Key = db.Column(db.String(100), unique=True, nullable=False)
    Value = db.Column(db.Text)
    
    def to_dict(self):
        return {
            'id': self.Id,
            'key': self.Key,
            'value': self.Value
        }
