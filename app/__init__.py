from flask import Flask
from flask_cors import CORS
from app.config import Config
from app.database import init_database
from app.middleware import require_auth

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)
    app.url_map.strict_slashes = False
    
    CORS(app, origins=['http://localhost:3000', 'http://localhost:8100', 'http://localhost:8082', 'http://localhost:5173'])
    
    init_database(app)
    
    from app.controllers.auth import auth_bp
    from app.controllers.customers import customers_bp
    from app.controllers.groups import groups_bp
    from app.controllers.invoices import invoices_bp
    from app.controllers.reminders import reminders_bp
    from app.controllers.services import services_bp
    from app.controllers.admin import admin_bp
    from app.controllers.messages import messages_bp
    from app.controllers.notes import notes_bp
    from app.controllers.tags import tags_bp
    from app.controllers.logs import logs_bp
    from app.controllers.notifications import notifications_bp
    from app.controllers.reports import reports_bp
    from app.controllers.user_tasks import user_tasks_bp
    from app.controllers.activities import activities_bp
    from app.controllers.dashboard import dashboard_bp
    from app.controllers.profile import profile_bp
    from app.controllers.settings import settings_bp
    from app.controllers.contracts import contracts_bp
    from app.controllers.meetings import meetings_bp
    from app.controllers.payments import payments_bp
    from app.controllers.templates import templates_bp
    from app.controllers.calendar_events import calendar_events_bp
    
    app.register_blueprint(auth_bp, url_prefix='/api/Auth')
    app.register_blueprint(customers_bp, url_prefix='/api/Customers')
    app.register_blueprint(groups_bp, url_prefix='/api/Groups')
    app.register_blueprint(invoices_bp, url_prefix='/api/Invoices')
    app.register_blueprint(reminders_bp, url_prefix='/api/Reminders')
    app.register_blueprint(services_bp, url_prefix='/api/Services')
    app.register_blueprint(admin_bp, url_prefix='/api/admin')
    app.register_blueprint(messages_bp, url_prefix='/api/Messages')
    app.register_blueprint(notes_bp, url_prefix='/api/Notes')
    app.register_blueprint(tags_bp, url_prefix='/api/Tags')
    app.register_blueprint(logs_bp, url_prefix='/api/Logs')
    app.register_blueprint(notifications_bp, url_prefix='/api/Notifications')
    app.register_blueprint(reports_bp, url_prefix='/api/reports')
    app.register_blueprint(user_tasks_bp, url_prefix='/api/user')
    app.register_blueprint(activities_bp, url_prefix='/api/Activities')
    app.register_blueprint(dashboard_bp, url_prefix='/api/dashboard')
    app.register_blueprint(profile_bp, url_prefix='/api/Profile')
    app.register_blueprint(settings_bp, url_prefix='/api/Settings')
    app.register_blueprint(contracts_bp, url_prefix='/api/Contracts')
    app.register_blueprint(meetings_bp)
    app.register_blueprint(calendar_events_bp)
    app.register_blueprint(payments_bp, url_prefix='/api/Payments')
    app.register_blueprint(templates_bp, url_prefix='/api/Templates')
    
    @app.route('/')
    def index():
        return {
            'message': 'CRM API w Python',
            'version': '1.0.0',
            'endpoints': {
                'auth': '/api/Auth',
                'customers': '/api/Customers',
                'groups': '/api/Groups',
                'invoices': '/api/Invoices',
                'reminders': '/api/Reminders',
                'services': '/api/Services'
            }
        }
    
    return app