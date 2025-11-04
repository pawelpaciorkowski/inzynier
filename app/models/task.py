from app.database import db
from datetime import datetime

# Tabela pomocnicza dla relacji many-to-many między zadaniami a tagami
task_tags = db.Table('TaskTags',
    db.Column('TaskId', db.Integer, db.ForeignKey('Tasks.Id'), primary_key=True),
    db.Column('TagId', db.Integer, db.ForeignKey('Tags.Id'), primary_key=True)
)

class Task(db.Model):
    __tablename__ = 'Tasks'
    
    Id = db.Column(db.Integer, primary_key=True)
    Title = db.Column(db.String(255), nullable=False)
    Description = db.Column(db.Text)
    DueDate = db.Column(db.DateTime)
    Completed = db.Column(db.Boolean, default=False)
    UserId = db.Column(db.Integer, db.ForeignKey('users.id', ondelete='CASCADE'), nullable=False)
    CustomerId = db.Column(db.Integer, db.ForeignKey('Customers.Id'))
    AssignedGroupId = db.Column(db.Integer)
    
    # Relacje
    user = db.relationship('User', backref=db.backref('tasks', cascade='all, delete-orphan'))
    customer = db.relationship('Customer', backref='tasks')
    # Relacja many-to-many z tagami
    tags = db.relationship('Tag', secondary=task_tags, backref='tasks')
    
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
