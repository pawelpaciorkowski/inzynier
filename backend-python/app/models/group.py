from app.database import db
from datetime import datetime

# Tabela pomocnicza dla relacji many-to-many między użytkownikami a grupami
user_groups = db.Table('UserGroups',
    db.Column('UserId', db.Integer, db.ForeignKey('users.id'), primary_key=True),
    db.Column('GroupId', db.Integer, db.ForeignKey('Groups.Id'), primary_key=True)
)

class Group(db.Model):
    __tablename__ = 'Groups'
    
    Id = db.Column(db.Integer, primary_key=True)
    Name = db.Column(db.String(255), nullable=False)
    Description = db.Column(db.Text)
    
    # Relacja many-to-many z użytkownikami
    members = db.relationship('User', secondary=user_groups, backref='groups')
    
    def to_dict(self):
        return {
            'id': self.Id,
            'name': self.Name,
            'description': self.Description
        }
