# Główny plik aplikacji CRM w Python
from app import create_app
from app.database import db
from app.models import User, Role, Customer, Reminder
from datetime import datetime, timedelta

app = create_app()

def create_tables():
    """Tworzy tabele w bazie danych"""
    db.create_all()
    
    # Seedowanie danych początkowych
    seed_database()

def seed_database():
    """Dodaje podstawowe dane do bazy"""
    
    # Sprawdź czy role już istnieją
    if not Role.query.first():
        # Utwórz podstawowe role
        roles = [
            Role(name='Admin', description='Administrator systemu'),
            Role(name='User', description='Standardowy użytkownik'),
            Role(name='Manager', description='Menedżer'),
            Role(name='Sprzedawca', description='Sprzedawca')
        ]
        
        for role in roles:
            db.session.add(role)
        
        db.session.commit()
        print("Role zostały utworzone")
    
    # Sprawdź czy użytkownicy już istnieją
    if not User.query.first():
        # Znajdź role
        admin_role = Role.query.filter_by(name='Admin').first()
        user_role = Role.query.filter_by(name='User').first()
        
        if admin_role and user_role:
            # Utwórz użytkowników testowych
            users = [
                User(
                    username='admin',
                    email='admin@example.com',
                    password_hash=User.hash_password('admin123'),
                    role_id=admin_role.id
                ),
                User(
                    username='user',
                    email='user@example.com',
                    password_hash=User.hash_password('user123'),
                    role_id=user_role.id
                )
            ]
            
            for user in users:
                db.session.add(user)
            
            db.session.commit()
            print("Użytkownicy testowi zostali utworzeni")
    
    # Sprawdź czy klienci już istnieją
    if not Customer.query.first():
        # Znajdź pierwszego użytkownika
        first_user = User.query.first()
        
        if first_user:
            # Utwórz klientów testowych
            customers = [
                Customer(
                    name='Jan Kowalski',
                    email='jan.kowalski@example.com',
                    phone='+48 123 456 789',
                    company='Kowalski Sp. z o.o.',
                    address='ul. Przykładowa 1, 00-001 Warszawa',
                    assigned_user_id=first_user.id
                ),
                Customer(
                    name='Anna Nowak',
                    email='anna.nowak@example.com',
                    phone='+48 987 654 321',
                    company='Nowak Consulting',
                    address='ul. Testowa 5, 30-001 Kraków',
                    assigned_user_id=first_user.id
                )
            ]
            
            for customer in customers:
                db.session.add(customer)
            
            db.session.commit()
            print("Klienci testowi zostali utworzeni")
    
    # Sprawdź czy przypomnienia już istnieją
    if not Reminder.query.first():
        # Znajdź pierwszego użytkownika
        first_user = User.query.first()
        
        if first_user:
            # Utwórz przypomnienia testowe
            reminders = [
                Reminder(
                    note='Przypomnienie o spotkaniu z klientem VIP',
                    remind_at=datetime.utcnow() + timedelta(days=1),
                    user_id=first_user.id
                ),
                Reminder(
                    note='Sprawdzić status płatności za fakturę',
                    remind_at=datetime.utcnow() + timedelta(days=3),
                    user_id=first_user.id
                )
            ]
            
            for reminder in reminders:
                db.session.add(reminder)
            
            db.session.commit()
            print("Przypomnienia testowe zostały utworzone")


if __name__ == '__main__':
    # Uruchom aplikację
    print("Uruchamianie CRM API w Python...")
    
    # Utwórz tabele i dane testowe
    with app.app_context():
        create_tables()
    
    print("Dostępne endpointy:")
    print("- POST /api/auth/login - logowanie")
    print("- POST /api/auth/register - rejestracja")
    print("- GET /api/reminders - lista przypomnień")
    print("- POST /api/reminders - utwórz przypomnienie")
    print("- GET /api/customers - lista klientów")
    print("- POST /api/customers - utwórz klienta")
    
    app.run(host='0.0.0.0', port=5000, debug=False)
