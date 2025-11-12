from app.database import db
from datetime import datetime

# Tabela pomocnicza dla relacji many-to-many między klientami a tagami
customer_tags = db.Table('CustomerTags',
    db.Column('CustomerId', db.Integer, db.ForeignKey('Customers.Id'), primary_key=True),
    db.Column('TagId', db.Integer, db.ForeignKey('Tags.Id'), primary_key=True)
)

class Customer(db.Model):
    __tablename__ = 'Customers'
    
    Id = db.Column(db.Integer, primary_key=True)
    Name = db.Column(db.String(255), nullable=False)
    Email = db.Column(db.String(255))
    Phone = db.Column(db.String(50))
    Company = db.Column(db.String(255))
    Address = db.Column(db.Text)
    NIP = db.Column(db.String(50))
    RepresentativeUserId = db.Column(db.Integer, db.ForeignKey('users.id', ondelete='SET NULL'), nullable=True)
    CreatedAt = db.Column(db.DateTime, default=datetime.utcnow)
    AssignedGroupId = db.Column(db.Integer)
    AssignedUserId = db.Column(db.Integer)
    
    # Relacje
    representative_user = db.relationship('User', foreign_keys=[RepresentativeUserId], backref='represented_customers')
    
    # Relacja many-to-many z tagami
    tags = db.relationship('Tag', secondary=customer_tags, backref='customers')
    
    def to_dict(self):
        customer_tags_list = [
            {
                'tagId': tag.Id,
                'tag': {
                    'id': tag.Id,
                    'name': tag.Name,
                    'color': tag.Color,
                    'description': tag.Description
                }
            }
            for tag in self.tags
        ]
        
        return {
            'id': self.Id,
            'name': self.Name,
            'email': self.Email,
            'phone': self.Phone,
            'company': self.Company,
            'address': self.Address,
            'nip': self.NIP,
            'representativeUserId': self.RepresentativeUserId,
            'representative': self.representative_user.to_dict() if self.representative_user else None,
            'createdAt': self.CreatedAt.isoformat() if self.CreatedAt else None,
            'assignedGroupId': self.AssignedGroupId,
            'assignedUserId': self.AssignedUserId,
            'customerTags': customer_tags_list  
        }
