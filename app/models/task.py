from app.database import db
from datetime import datetime

class Task(db.Model):
    __tablename__ = 'Tasks'
    
    Id = db.Column(db.Integer, primary_key=True)
    Title = db.Column(db.String(255), nullable=False)
    Description = db.Column(db.Text)
    DueDate = db.Column(db.DateTime)
    Completed = db.Column(db.Boolean, default=False)
    UserId = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    CustomerId = db.Column(db.Integer, db.ForeignKey('Customers.Id'))
    AssignedGroupId = db.Column(db.Integer)
    
    # Relacje
    user = db.relationship('User', backref='tasks')
    customer = db.relationship('Customer', backref='tasks')
    
    def to_dict(self):
        return {
            'id': self.Id,
            'title': self.Title,
            'description': self.Description,
            'dueDate': self.DueDate.isoformat() if self.DueDate else None,
            'completed': self.Completed,
            'userId': self.UserId,
            'customerId': self.CustomerId,
            'assignedGroupId': self.AssignedGroupId
        }
