"""
Skrypt tworzący tabelę InvoiceItems w bazie danych
"""
from app import create_app
from app.database import db
from app.models import InvoiceItem

app = create_app()

with app.app_context():
    # Tworzy tabelę InvoiceItems
    db.create_all()
    print("✅ Tabela InvoiceItems została utworzona!")
