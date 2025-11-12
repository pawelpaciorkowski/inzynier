from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()

def init_database(app):
    db.init_app(app)
    
    with app.app_context():
        from app.models import (
            User, Role, Customer, Task, Message, Activity,
            Reminder, Notification, Invoice, InvoiceItem, Group, Meeting,
            Note, Tag, Contract, Service, Payment, TaxRate,
            Template, Setting, SystemLog, LoginHistory, CalendarEvent
        )
        
        db.create_all()
        print("✅ Tabele w bazie danych zostały utworzone!")
