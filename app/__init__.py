# Główny plik inicjalizacyjny aplikacji
from flask import Flask
from flask_cors import CORS
# from flask_jwt_extended import JWTManager  # Nie używamy - mamy własny middleware
from config import Config
from app.database import init_database

# Import PyMySQL przed SQLAlchemy
import pymysql
pymysql.install_as_MySQLdb()

def create_app():
    """Tworzy i konfiguruje aplikację Flask"""
    app = Flask(__name__)

    # Załaduj konfigurację
    app.config.from_object(Config)

    # Wyłącz automatyczne generowanie ETag
    app.config['SEND_FILE_MAX_AGE_DEFAULT'] = 0

    # Inicjalizuj bazę danych
    init_database(app)
    
    # Inicjalizuj JWT - nie używamy JWTManager, mamy własny middleware
    # jwt = JWTManager(app)
    
    # Konfiguruj CORS
    CORS(app, origins=Config.CORS_ORIGINS)

    # Middleware - usuń ETag z odpowiedzi
    @app.after_request
    def remove_etag(response):
        response.headers.pop('ETag', None)
        return response

    # Zarejestruj blueprinty (kontrolery) - używamy tych samych ścieżek co backend C#
    from app.controllers import auth_bp, reminders_bp, customers_bp, admin_bp, notifications_bp, user_tasks_bp, messages_bp, dashboard_bp, invoices_bp, services_bp, groups_bp, notes_bp, meetings_bp, contracts_bp, payments_bp, activities_bp, calendar_events_bp, logs_bp, profile_bp, reports_bp, settings_bp, tags_bp, templates_bp

    app.register_blueprint(auth_bp, url_prefix='/api/Auth')
    app.register_blueprint(reminders_bp, url_prefix='/api/Reminders')
    app.register_blueprint(customers_bp, url_prefix='/api/Customers')
    app.register_blueprint(admin_bp, url_prefix='/api/admin')
    app.register_blueprint(notifications_bp, url_prefix='/api/Notifications')
    app.register_blueprint(user_tasks_bp, url_prefix='/api/user')
    app.register_blueprint(messages_bp, url_prefix='/api/Messages')
    app.register_blueprint(dashboard_bp, url_prefix='/api/admin')
    app.register_blueprint(invoices_bp, url_prefix='/api/Invoices')
    app.register_blueprint(services_bp, url_prefix='/api/Services')
    app.register_blueprint(groups_bp, url_prefix='/api/Groups')
    app.register_blueprint(notes_bp, url_prefix='/api/Notes')
    app.register_blueprint(meetings_bp, url_prefix='/api/Meetings')
    app.register_blueprint(contracts_bp, url_prefix='/api/Contracts')
    app.register_blueprint(payments_bp, url_prefix='/api/Payments')
    app.register_blueprint(activities_bp, url_prefix='/api/Activities')
    app.register_blueprint(calendar_events_bp, url_prefix='/api/CalendarEvents')
    app.register_blueprint(logs_bp, url_prefix='/api/Logs')
    app.register_blueprint(profile_bp, url_prefix='/api/Profile')
    app.register_blueprint(reports_bp, url_prefix='/api/Reports')
    app.register_blueprint(reports_bp, url_prefix='/api/reports', name='reports_lowercase')  # Alias z małą literą
    app.register_blueprint(settings_bp, url_prefix='/api/Settings')
    app.register_blueprint(tags_bp, url_prefix='/api/Tags')
    app.register_blueprint(templates_bp, url_prefix='/api/Templates')
    
    # Dodaj podstawowe endpointy
    @app.route('/')
    def index():
        """Strona główna API"""
        return {
            'message': 'CRM API w Python',
            'version': '1.0.0',
            'endpoints': {
                'auth': '/api/Auth',
                'reminders': '/api/Reminders',
                'customers': '/api/Customers',
                'invoices': '/api/Invoices',
                'services': '/api/Services',
                'groups': '/api/Groups'
            }
        }

    @app.route('/health')
    def health():
        """Sprawdzenie stanu aplikacji"""
        from datetime import datetime
        return {'status': 'OK', 'timestamp': datetime.utcnow().isoformat()}
    
    return app