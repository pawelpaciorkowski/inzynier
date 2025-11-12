from flask import Blueprint, request, jsonify, make_response
from app.middleware import require_auth, get_current_user
from app.database import db
from app.models import SystemLog
import xlsxwriter
import io
from datetime import datetime

logs_bp = Blueprint('logs', __name__)

@logs_bp.route('/', methods=['GET'])
@require_auth
def get_logs():
    """Pobiera listę logów systemowych"""
    try:
        user = get_current_user()
        if not user:
            return jsonify({'error': 'Użytkownik nie znaleziony'}), 401
        
        # Sprawdź czy użytkownik ma uprawnienia administratora
        if user.role.name != 'Admin':
            return jsonify({'error': 'Brak uprawnień administratora'}), 403
        
        logs = SystemLog.query.order_by(SystemLog.Timestamp.desc()).limit(100).all()
        return jsonify([log.to_dict() for log in logs]), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@logs_bp.route('/export', methods=['GET'])
@require_auth
def export_logs():
    """Eksportuje logi systemowe do Excel"""
    try:
        user = get_current_user()
        if not user:
            return jsonify({'error': 'Użytkownik nie znaleziony'}), 401
        
        # Sprawdź czy użytkownik ma uprawnienia administratora
        if user.role.name != 'Admin':
            return jsonify({'error': 'Brak uprawnień administratora'}), 403
        
        # Pobierz wszystkie logi
        logs = SystemLog.query.order_by(SystemLog.Timestamp.desc()).all()
        
        # Utwórz plik Excel w pamięci
        output = io.BytesIO()
        workbook = xlsxwriter.Workbook(output, {'in_memory': True})
        worksheet = workbook.add_worksheet('Logi systemowe')
        
        # Style
        header_format = workbook.add_format({
            'bold': True,
            'bg_color': '#4472C4',
            'font_color': 'white',
            'border': 1
        })
        
        cell_format = workbook.add_format({
            'border': 1,
            'text_wrap': True
        })
        
        # Nagłówki
        headers = ['ID', 'Poziom', 'Wiadomość', 'Źródło', 'Użytkownik', 'Szczegóły', 'Data']
        for col, header in enumerate(headers):
            worksheet.write(0, col, header, header_format)
        
        # Dane
        for row, log in enumerate(logs, 1):
            worksheet.write(row, 0, log.Id, cell_format)
            worksheet.write(row, 1, log.Level, cell_format)
            worksheet.write(row, 2, log.Message, cell_format)
            worksheet.write(row, 3, log.Source, cell_format)
            worksheet.write(row, 4, log.UserId or 'System', cell_format)
            worksheet.write(row, 5, log.Details or '', cell_format)
            worksheet.write(row, 6, log.Timestamp.strftime('%Y-%m-%d %H:%M:%S') if log.Timestamp else '', cell_format)
        
        # Dostosuj szerokość kolumn
        worksheet.set_column('A:A', 8)   # ID
        worksheet.set_column('B:B', 12)  # Poziom
        worksheet.set_column('C:C', 50)  # Wiadomość
        worksheet.set_column('D:D', 20)  # Źródło
        worksheet.set_column('E:E', 15)  # Użytkownik
        worksheet.set_column('F:F', 30)  # Szczegóły
        worksheet.set_column('G:G', 20)  # Data
        
        workbook.close()
        output.seek(0)
        
        # Przygotuj odpowiedź
        response = make_response(output.getvalue())
        response.headers['Content-Type'] = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        response.headers['Content-Disposition'] = f'attachment; filename=logi_systemowe_{datetime.now().strftime("%Y%m%d_%H%M%S")}.xlsx'
        
        return response
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

def log_system_event(level, message, source, user_id=None, details=None):
    """Funkcja pomocnicza do logowania zdarzeń systemowych"""
    try:
        log_entry = SystemLog(
            Level=level,
            Message=message,
            Source=source,
            UserId=user_id,
            Details=details
        )
        
        db.session.add(log_entry)
        db.session.commit()
    except Exception as e:
        print(f"Błąd przy logowaniu zdarzenia: {e}")
        db.session.rollback()