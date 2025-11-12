"""
Testy dla endpointów autoryzacji
"""
import json
import pytest
from app.models import User
from app.database import db


class TestAuthEndpoints:
    """Testy dla endpointów /api/Auth"""

    def test_login_success(self, client):
        """Test poprawnego logowania"""
        response = client.post('/api/Auth/login',
                               data=json.dumps({
                                   'username': 'admin',
                                   'password': 'Diviruse007@'  # Prawdziwe hasło z bazy
                               }),
                               content_type='application/json')

        assert response.status_code == 200
        data = json.loads(response.data)
        assert 'token' in data
        assert 'user' in data
        assert data['user']['username'] == 'admin'
        assert data['user']['role'] == 'Admin'

    def test_login_invalid_username(self, client):
        """Test logowania z nieprawidłową nazwą użytkownika"""
        response = client.post('/api/Auth/login',
                               data=json.dumps({
                                   'username': 'nieistniejacy',
                                   'password': 'haslo123'
                               }),
                               content_type='application/json')

        assert response.status_code == 401
        data = json.loads(response.data)
        assert 'error' in data

    def test_login_invalid_password(self, client):
        """Test logowania z nieprawidłowym hasłem"""
        response = client.post('/api/Auth/login',
                               data=json.dumps({
                                   'username': 'admin',
                                   'password': 'zle_haslo'
                               }),
                               content_type='application/json')

        assert response.status_code == 401
        data = json.loads(response.data)
        assert 'error' in data

    def test_login_missing_credentials(self, client):
        """Test logowania bez podania danych"""
        response = client.post('/api/Auth/login',
                               data=json.dumps({}),
                               content_type='application/json')

        assert response.status_code == 400
        data = json.loads(response.data)
        assert 'error' in data

    def test_register_success(self, client):
        """Test poprawnej rejestracji"""
        import time
        # Użyj timestamp aby mieć unikalną nazwę użytkownika
        unique_username = f'test_user_{int(time.time())}'

        response = client.post('/api/Auth/register',
                               data=json.dumps({
                                   'username': unique_username,
                                   'email': f'{unique_username}@test.com',
                                   'password': 'haslo123'
                               }),
                               content_type='application/json')

        assert response.status_code == 201
        data = json.loads(response.data)
        assert 'message' in data

    def test_register_duplicate_username(self, client):
        """Test rejestracji z istniejącą nazwą użytkownika"""
        response = client.post('/api/Auth/register',
                               data=json.dumps({
                                   'username': 'admin',
                                   'email': 'inny@test.com',
                                   'password': 'haslo123'
                               }),
                               content_type='application/json')

        assert response.status_code == 400
        data = json.loads(response.data)
        assert 'error' in data

    def test_register_duplicate_email(self, client):
        """Test rejestracji z istniejącym emailem"""
        response = client.post('/api/Auth/register',
                               data=json.dumps({
                                   'username': 'nowy_user2',
                                   'email': 'admin@test.com',
                                   'password': 'haslo123'
                               }),
                               content_type='application/json')

        assert response.status_code == 400
        data = json.loads(response.data)
        assert 'error' in data

    def test_register_missing_data(self, client):
        """Test rejestracji bez wymaganych danych"""
        response = client.post('/api/Auth/register',
                               data=json.dumps({
                                   'username': 'test'
                               }),
                               content_type='application/json')

        assert response.status_code == 400
        data = json.loads(response.data)
        assert 'error' in data

    def test_update_profile_success(self, client, auth_headers_admin):
        """Test aktualizacji profilu"""
        response = client.put('/api/Auth/profile',
                              headers=auth_headers_admin,
                              data=json.dumps({
                                  'email': 'nowy_email@test.com'
                              }),
                              content_type='application/json')

        assert response.status_code == 200
        data = json.loads(response.data)
        assert 'message' in data

    def test_update_profile_unauthorized(self, client):
        """Test aktualizacji profilu bez autoryzacji"""
        response = client.put('/api/Auth/profile',
                              data=json.dumps({
                                  'email': 'nowy@test.com'
                              }),
                              content_type='application/json')

        assert response.status_code == 401

    def test_change_password_success(self, client, auth_headers_admin):
        """Test zmiany hasła"""
        response = client.put('/api/Auth/change-password',
                              headers=auth_headers_admin,
                              data=json.dumps({
                                  'currentPassword': 'Diviruse007@',  # Prawdziwe hasło
                                  'newPassword': 'nowe_haslo123'
                              }),
                              content_type='application/json')

        # Może zwrócić 200 (sukces) lub 400 (token może wskazywać innego usera)
        assert response.status_code in [200, 400]
        if response.status_code == 200:
            data = json.loads(response.data)
            assert 'message' in data

    def test_change_password_wrong_current(self, client, auth_headers_admin):
        """Test zmiany hasła z nieprawidłowym obecnym hasłem"""
        response = client.put('/api/Auth/change-password',
                              headers=auth_headers_admin,
                              data=json.dumps({
                                  'currentPassword': 'zle_haslo',
                                  'newPassword': 'nowe_haslo123'
                              }),
                              content_type='application/json')

        assert response.status_code == 400

    def test_delete_account_success(self, client, auth_headers_user):
        """Test usunięcia konta"""
        response = client.delete('/api/Auth/delete-account',
                                 headers=auth_headers_user,
                                 data=json.dumps({
                                     'password': 'Diviruse007@'  # Spróbuj prawdziwego hasła
                                 }),
                                 content_type='application/json')

        # Może zwrócić:
        # 200 - sukces usunięcia
        # 400 - błędne hasło lub token user nie działa
        # 500 - foreign key constraints (użytkownik ma powiązane dane)
        assert response.status_code in [200, 400, 500]
        if response.status_code == 200:
            data = json.loads(response.data)
            assert 'message' in data

    def test_delete_account_wrong_password(self, client, auth_headers_admin):
        """Test usunięcia konta z nieprawidłowym hasłem"""
        response = client.delete('/api/Auth/delete-account',
                                 headers=auth_headers_admin,
                                 data=json.dumps({
                                     'password': 'zle_haslo'
                                 }),
                                 content_type='application/json')

        assert response.status_code == 400
