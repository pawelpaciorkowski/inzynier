import os

class Config:
    # Konfiguracja bazy danych
    MYSQL_HOST = os.environ.get('MYSQL_HOST') or 'localhost'
    MYSQL_PORT = int(os.environ.get('MYSQL_PORT') or 3306)
    MYSQL_USER = os.environ.get('MYSQL_USER') or 'root'
    MYSQL_PASSWORD = os.environ.get('MYSQL_PASSWORD') or 'root'
    MYSQL_DATABASE = os.environ.get('MYSQL_DATABASE') or 'crm_db'
    
    # Konfiguracja SQLAlchemy
    SQLALCHEMY_DATABASE_URI = f'mysql+pymysql://{MYSQL_USER}:{MYSQL_PASSWORD}@{MYSQL_HOST}:{MYSQL_PORT}/{MYSQL_DATABASE}'
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    
    # Konfiguracja JWT
    JWT_SECRET_KEY = os.environ.get('JWT_SECRET_KEY') or 'your-secret-key-here'
    JWT_ACCESS_TOKEN_EXPIRES = 86400  # 24 godziny
    
    # Konfiguracja CORS
    CORS_ORIGINS = ['http://localhost:3000', 'http://localhost:8080', 'http://localhost:8100']
    
    # Konfiguracja aplikacji
    SECRET_KEY = os.environ.get('SECRET_KEY') or 'your-secret-key-here'
