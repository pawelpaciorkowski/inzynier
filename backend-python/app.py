#!/usr/bin/env python3

from app import create_app

if __name__ == '__main__':
    print("Uruchamianie CRM API w Python...")
    print("Dostępne endpointy:")
    print("- POST /api/auth/login - logowanie")
    print("- POST /api/auth/register - rejestracja")
    print("- GET /api/reminders - lista przypomnień")
    print("- POST /api/reminders - utwórz przypomnienie")
    print("- GET /api/customers - lista klientów")
    print("- POST /api/customers - utwórz klienta")
    
    app = create_app()
    app.run(host='0.0.0.0', port=5000, debug=True)