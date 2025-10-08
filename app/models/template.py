from app.database import db
from datetime import datetime

class Template(db.Model):
    __tablename__ = 'Templates'
    
    Id = db.Column(db.Integer, primary_key=True)
    Name = db.Column(db.String(255), nullable=False)
    FileName = db.Column(db.String(255), nullable=False)
    FilePath = db.Column(db.String(255), nullable=False)
    UploadedAt = db.Column(db.DateTime, nullable=False)
    
    def to_dict(self):
        return {
            'id': self.Id,
            'name': self.Name,
            'fileName': self.FileName,
            'filePath': self.FilePath,
            'uploadedAt': self.UploadedAt.isoformat() if self.UploadedAt else None
        }
