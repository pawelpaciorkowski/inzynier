from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import text
import os

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
        
        # Utwórz widoki, procedury, funkcje i indeksy jeśli nie istnieją
        try:
            create_database_enhancements()
        except Exception as e:
            print(f"⚠️  Uwaga: Nie udało się utworzyć rozszerzeń bazy danych: {e}")
            print("   Możesz utworzyć je ręcznie uruchamiając: database_enhancements.sql")

def create_database_enhancements():
    """Tworzy widoki, procedury, funkcje i indeksy w bazie danych"""
    
    # Sprawdź czy widoki już istnieją
    views_check = db.session.execute(text("""
        SELECT COUNT(*) FROM information_schema.VIEWS 
        WHERE TABLE_SCHEMA = DATABASE() 
        AND TABLE_NAME IN ('v_customer_invoice_summary', 'v_invoice_details', 'v_group_statistics')
    """)).scalar()
    
    if views_check == 0:
        print("📊 Tworzenie widoków...")
        # Widoki będą tworzone przez skrypt SQL (nie można przez SQLAlchemy)
        pass
    
    # Sprawdź czy procedury już istnieją
    procedures_check = db.session.execute(text("""
        SELECT COUNT(*) FROM information_schema.ROUTINES 
        WHERE ROUTINE_SCHEMA = DATABASE() 
        AND ROUTINE_TYPE = 'PROCEDURE'
        AND ROUTINE_NAME IN ('sp_create_invoice', 'sp_update_invoice_payment_status', 'sp_generate_sales_report')
    """)).scalar()
    
    if procedures_check == 0:
        print("⚙️  Tworzenie procedur składowanych...")
        # Procedury będą tworzone przez skrypt SQL
    
    # Sprawdź czy funkcje już istnieją
    functions_check = db.session.execute(text("""
        SELECT COUNT(*) FROM information_schema.ROUTINES 
        WHERE ROUTINE_SCHEMA = DATABASE() 
        AND ROUTINE_TYPE = 'FUNCTION'
        AND ROUTINE_NAME IN ('fn_calculate_invoice_total', 'fn_format_date_polish', 'fn_is_invoice_overdue')
    """)).scalar()
    
    if functions_check == 0:
        print("🔧 Tworzenie funkcji...")
        # Funkcje będą tworzone przez skrypt SQL
    
    print("💡 Aby utworzyć widoki, procedury i funkcje, uruchom: mysql -u root -p crm_project < database_enhancements.sql")
