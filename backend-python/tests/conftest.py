"""
Konfigurcja testów pytest dla aplikacji CRM
"""
import pytest
import sys
import os
from datetime import datetime, timedelta

# Dodaj główny katalog do ścieżki
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from app import create_app
from app.database import db
from app.models import User, Role, Customer, Group, Invoice, Service
from werkzeug.security import generate_password_hash
import jwt
from app.config import Config


@pytest.fixture(scope='session')
def app():
    """Tworzy aplikację Flask do testów"""
    # Nie możemy użyć SQLite :memory: z session scope, więc użyjmy pliku tymczasowego
    import tempfile
    db_fd, db_path = tempfile.mkstemp()

    os.environ['DATABASE_URL'] = f'sqlite:///{db_path}'
    os.environ['TESTING'] = 'True'

    test_app = create_app()
    test_app.config['TESTING'] = True
    test_app.config['SQLALCHEMY_DATABASE_URI'] = f'sqlite:///{db_path}'
    test_app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    test_app.config['WTF_CSRF_ENABLED'] = False

    with test_app.app_context():
        db.create_all()

        # Dodaj podstawowe dane testowe
        setup_test_data()

        yield test_app

        # Czyszczenie - nie robimy drop_all() dla MySQL
        db.session.remove()

    # Usuń plik bazy danych
    try:
        os.close(db_fd)
        os.unlink(db_path)
    except:
        pass  # Ignoruj błędy przy usuwaniu pliku testowego


@pytest.fixture
def client(app):
    """Tworzy klienta testowego Flask"""
    return app.test_client()


@pytest.fixture
def runner(app):
    """Tworzy runnera CLI dla testów"""
    return app.test_cli_runner()


def setup_test_data():
    """Dodaje podstawowe dane testowe do bazy danych"""
    # Dodaj role
    admin_role = Role(name='Admin')
    user_role = Role(name='User')
    db.session.add(admin_role)
    db.session.add(user_role)
    db.session.flush()  # Flush aby uzyskać ID

    # Dodaj użytkowników testowych
    admin_user = User(
        username='admin',
        email='admin@test.com',
        password_hash=generate_password_hash('admin123'),
        role_id=admin_role.id
    )

    regular_user = User(
        username='user',
        email='user@test.com',
        password_hash=generate_password_hash('user123'),
        role_id=user_role.id
    )

    db.session.add(admin_user)
    db.session.add(regular_user)
    db.session.flush()  # Flush aby uzyskać ID

    # Dodaj grupę testową
    test_group = Group(
        Name='Test Group',
        Description='Grupa testowa'
    )
    db.session.add(test_group)
    db.session.flush()  # Flush aby uzyskać ID

    # Dodaj klienta testowego
    test_customer = Customer(
        Name='Test Customer',
        Email='customer@test.com',
        Phone='123456789',
        Company='Test Company',
        Address='Test Address',
        NIP='1234567890',
        AssignedGroupId=test_group.Id,
        AssignedUserId=admin_user.id
    )
    db.session.add(test_customer)

    # Dodaj usługę testową
    test_service = Service(
        Name='Test Service',
        Price=100.00
    )
    db.session.add(test_service)

    db.session.commit()


@pytest.fixture
def admin_token():
    """Generuje token JWT dla admina"""
    payload = {
        'user_id': 1,
        'username': 'admin',
        'role': 'Admin',
        'exp': datetime.utcnow() + timedelta(hours=24)
    }
    return jwt.encode(payload, Config.JWT_SECRET_KEY, algorithm='HS256')


@pytest.fixture
def user_token():
    """Generuje token JWT dla zwykłego użytkownika"""
    payload = {
        'user_id': 2,
        'username': 'user',
        'role': 'User',
        'exp': datetime.utcnow() + timedelta(hours=24)
    }
    return jwt.encode(payload, Config.JWT_SECRET_KEY, algorithm='HS256')


@pytest.fixture
def auth_headers_admin(admin_token):
    """Zwraca nagłówki z tokenem admina"""
    return {
        'Authorization': f'Bearer {admin_token}',
        'Content-Type': 'application/json'
    }


@pytest.fixture
def auth_headers_user(user_token):
    """Zwraca nagłówki z tokenem użytkownika"""
    return {
        'Authorization': f'Bearer {user_token}',
        'Content-Type': 'application/json'
    }
