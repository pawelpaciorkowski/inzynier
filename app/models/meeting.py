from app.database import db
from datetime import datetime

class Meeting(db.Model):
    __tablename__ = 'Meetings'
    
    Id = db.Column(db.Integer, primary_key=True)
    Topic = db.Column(db.String(255), nullable=False)
    ScheduledAt = db.Column(db.DateTime, nullable=False)
    CustomerId = db.Column(db.Integer, db.ForeignKey('Customers.Id'), nullable=False)
    AssignedGroupId = db.Column(db.Integer, db.ForeignKey('Groups.Id'), nullable=True)
    CreatedByUserId = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=True)
    
    # Relacje
    customer = db.relationship('Customer', backref='meetings')
    assigned_group = db.relationship('Group', backref='meetings')
    created_by_user = db.relationship('User', backref='meetings')
    
    def to_dict(self):
        return {
            'id': self.Id,
            'topic': self.Topic,
            'scheduledAt': self.ScheduledAt.isoformat() if self.ScheduledAt else None,
            'customerId': self.CustomerId,
            'assignedGroupId': self.AssignedGroupId,
            'createdByUserId': self.CreatedByUserId
        }