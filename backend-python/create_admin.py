#!/usr/bin/env python
"""
Skrypt do tworzenia użytkownika admin w bazie danych CRM.
Uruchom: python create_admin.py
"""

from werkzeug.security import generate_password_hash
from app import create_app
from app.database import db
from app.models.user import User
from app.models.role import Role

def create_admin_user():
    """Tworzy użytkownika admin z rolą Administrator"""
    
    app = create_app()
    
    with app.app_context():
        admin_role = Role.query.filter_by(name='Admin').first()
        
        if not admin_role:
            admin_role = Role(
                name='Admin',
                Description='Administrator systemu z pełnymi uprawnieniami'
            )
            db.session.add(admin_role)
            db.session.commit()
            print("✅ Utworzono rolę Admin")
        else:
            print("✅ Rola Admin już istnieje")
        
        existing_admin = User.query.filter_by(username='admin').first()
        
        if existing_admin:
            print("⚠️  Użytkownik 'admin' już istnieje!")
            response = input("Czy chcesz zaktualizować hasło? (tak/nie): ")
            
            if response.lower() in ['tak', 't', 'yes', 'y']:
                existing_admin.password_hash = generate_password_hash('Diviruse007@')
                db.session.commit()
                print("✅ Hasło użytkownika admin zostało zaktualizowane!")
            else:
                print("❌ Anulowano operację")
                return
        else:
            admin_user = User(
                username='admin',
                email='admin@crm.local',
                password_hash=generate_password_hash('Diviruse007@'),
                role_id=admin_role.id
            )
            
            db.session.add(admin_user)
            db.session.commit()
            
            print("✅ Użytkownik admin został utworzony!")
        
        print("\n" + "="*50)
        print("DANE LOGOWANIA:")
        print("="*50)
        print("Username: admin")
        print("Password: Diviruse007@")
        print("="*50)

if __name__ == '__main__':
    try:
        create_admin_user()
    except Exception as e:
        print(f"❌ Błąd: {e}")
        import traceback
        traceback.print_exc()














