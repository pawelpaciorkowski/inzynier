"""
Skrypt do czyszczenia historii płatności
"""
from app import create_app
from app.database import db
from app.models import Payment

app = create_app()

with app.app_context():
    # Pokaż ile płatności jest w bazie
    count = Payment.query.count()
    print(f"📊 Znaleziono {count} płatności w bazie")

    if count == 0:
        print("✅ Baza jest już pusta!")
    else:
        # Pokaż przykłady
        payments = Payment.query.limit(5).all()
        print("\n📋 Przykładowe płatności:")
        for p in payments:
            print(f"  - ID: {p.Id}, Faktura: {p.InvoiceId}, Kwota: {p.Amount}, Data: {p.PaidAt}")

        # Zapytaj o potwierdzenie
        confirm = input(f"\n⚠️  Czy na pewno usunąć WSZYSTKIE {count} płatności? (tak/nie): ")

        if confirm.lower() == 'tak':
            Payment.query.delete()
            db.session.commit()
            print(f"✅ Usunięto {count} płatności!")
        else:
            print("❌ Anulowano - nic nie zostało usunięte")
