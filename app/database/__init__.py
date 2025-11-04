from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()

def init_database(app):
    # Inicjalizacja bazy danych z aplikacją Flask
    db.init_app(app)
    
    # Tworzenie kontekstu aplikacji i tabel w bazie danych
    with app.app_context():
        # Import wszystkich modeli przed utworzeniem tabel
        # Bez tego import, db.create_all() nie znajdzie modeli
        from app.models import (
            User, Role, Customer, Task, Message, Activity,
            Reminder, Notification, Invoice, InvoiceItem, Group, Meeting,
            Note, Tag, Contract, Service, Payment, TaxRate,
            Template, Setting, SystemLog, LoginHistory, CalendarEvent
        )
        
        # Utworzenie wszystkich tabel w bazie danych
        db.create_all()
        print("✅ Tabele w bazie danych zostały utworzone!")
