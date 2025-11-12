"""
Testy dla endpointów klientów
"""
import json
import pytest


class TestCustomersEndpoints:
    """Testy dla endpointów /api/Customers"""

    def test_get_customers_success(self, client, auth_headers_admin):
        """Test pobierania listy klientów"""
        response = client.get('/api/Customers/',
                              headers=auth_headers_admin)

        assert response.status_code == 200
        data = json.loads(response.data)
        assert isinstance(data, list)
        # Lista może być pusta lub pełna
        assert isinstance(data, list)

    def test_get_customers_unauthorized(self, client):
        """Test pobierania listy klientów bez autoryzacji"""
        response = client.get('/api/Customers/')

        assert response.status_code == 401

    def test_create_customer_success(self, client, auth_headers_admin):
        """Test tworzenia nowego klienta"""
        response = client.post('/api/Customers/',
                               headers=auth_headers_admin,
                               data=json.dumps({
                                   'name': 'Nowy Klient',
                                   'email': 'nowy@klient.pl',
                                   'phone': '987654321',
                                   'company': 'Nova Company',
                                   'address': 'ul. Nowa 1',
                                   'nip': '9876543210'
                               }),
                               content_type='application/json')

        assert response.status_code == 201
        data = json.loads(response.data)
        assert data['name'] == 'Nowy Klient'
        assert data['email'] == 'nowy@klient.pl'

    def test_create_customer_unauthorized(self, client):
        """Test tworzenia klienta bez autoryzacji"""
        response = client.post('/api/Customers/',
                               data=json.dumps({
                                   'name': 'Test',
                                   'email': 'test@test.pl'
                               }),
                               content_type='application/json')

        assert response.status_code == 401

    def test_get_customer_by_id_success(self, client, auth_headers_admin):
        """Test pobierania szczegółów klienta"""
        # Najpierw utwórz klienta
        create_response = client.post('/api/Customers/',
                                      headers=auth_headers_admin,
                                      data=json.dumps({
                                          'name': 'Test Get Customer',
                                          'email': 'testget@test.com'
                                      }),
                                      content_type='application/json')

        customer_id = json.loads(create_response.data)['id']

        response = client.get(f'/api/Customers/{customer_id}',
                              headers=auth_headers_admin)

        assert response.status_code == 200
        data = json.loads(response.data)
        assert data['id'] == customer_id
        assert 'name' in data

    def test_get_customer_by_id_not_found(self, client, auth_headers_admin):
        """Test pobierania nieistniejącego klienta"""
        response = client.get('/api/Customers/9999',
                              headers=auth_headers_admin)

        assert response.status_code == 404

    def test_update_customer_success(self, client, auth_headers_admin):
        """Test aktualizacji klienta"""
        # Najpierw utwórz klienta
        create_response = client.post('/api/Customers/',
                                      headers=auth_headers_admin,
                                      data=json.dumps({
                                          'name': 'Test Update Customer',
                                          'email': 'testupdate@test.com'
                                      }),
                                      content_type='application/json')

        customer_id = json.loads(create_response.data)['id']

        response = client.put(f'/api/Customers/{customer_id}',
                              headers=auth_headers_admin,
                              data=json.dumps({
                                  'name': 'Zaktualizowany Klient',
                                  'email': 'updated@test.com'
                              }),
                              content_type='application/json')

        assert response.status_code == 200
        data = json.loads(response.data)
        assert data['name'] == 'Zaktualizowany Klient'

    def test_update_customer_not_found(self, client, auth_headers_admin):
        """Test aktualizacji nieistniejącego klienta"""
        response = client.put('/api/Customers/9999',
                              headers=auth_headers_admin,
                              data=json.dumps({
                                  'name': 'Test'
                              }),
                              content_type='application/json')

        assert response.status_code == 404

    def test_delete_customer_success(self, client, auth_headers_admin):
        """Test usuwania klienta"""
        # Najpierw utwórz klienta do usunięcia
        create_response = client.post('/api/Customers/',
                                      headers=auth_headers_admin,
                                      data=json.dumps({
                                          'name': 'Klient do usunięcia',
                                          'email': 'delete@test.com'
                                      }),
                                      content_type='application/json')

        customer_id = json.loads(create_response.data)['id']

        # Usuń klienta
        response = client.delete(f'/api/Customers/{customer_id}',
                                 headers=auth_headers_admin)

        assert response.status_code == 200
        data = json.loads(response.data)
        assert 'message' in data

    def test_delete_customer_not_found(self, client, auth_headers_admin):
        """Test usuwania nieistniejącego klienta"""
        response = client.delete('/api/Customers/9999',
                                 headers=auth_headers_admin)

        assert response.status_code == 404
