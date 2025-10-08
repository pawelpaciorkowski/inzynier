from flask import Blueprint, request, jsonify, current_app
from werkzeug.utils import secure_filename
import os
from app.database import db
from app.models.template import Template
from app.middleware import require_auth, get_current_user_id
from datetime import datetime
import json

templates_bp = Blueprint('templates', __name__)

@templates_bp.route('/', methods=['GET'])
@require_auth
def get_templates():
    """Pobierz wszystkie szablony dla zalogowanego użytkownika"""
    try:
        user_id = get_current_user_id()
        
        # Pobierz wszystkie szablony (model nie ma pól Type i Category)
        templates = Template.query.order_by(Template.Name).all()
        
        return jsonify([template.to_dict() for template in templates]), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@templates_bp.route('/', methods=['POST'])
@require_auth
def create_template():
    """Utwórz nowy szablon"""
    try:
        user_id = get_current_user_id()
        data = request.get_json()
        
        # Walidacja wymaganych pól
        required_fields = ['name', 'fileName', 'filePath']
        for field in required_fields:
            if field not in data:
                return jsonify({'error': f'Pole {field} jest wymagane'}), 400
        
        # Utwórz nowy szablon
        template = Template(
            Name=data['name'],
            FileName=data['fileName'],
            FilePath=data['filePath'],
            UploadedAt=datetime.now()
        )
        
        db.session.add(template)
        db.session.commit()
        
        return jsonify(template.to_dict()), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@templates_bp.route('/<int:template_id>', methods=['GET'])
@require_auth
def get_template(template_id):
    """Pobierz konkretny szablon"""
    try:
        user_id = get_current_user_id()
        template = Template.query.filter_by(Id=template_id).first()
        
        if not template:
            return jsonify({'error': 'Szablon nie został znaleziony'}), 404
            
        return jsonify(template.to_dict()), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@templates_bp.route('/<int:template_id>', methods=['PUT'])
@require_auth
def update_template(template_id):
    """Zaktualizuj szablon"""
    try:
        user_id = get_current_user_id()
        template = Template.query.filter_by(Id=template_id).first()
        
        if not template:
            return jsonify({'error': 'Szablon nie został znaleziony'}), 404
        
        data = request.get_json()
        
        # Aktualizuj pola
        if 'name' in data:
            template.Name = data['name']
        if 'fileName' in data:
            template.FileName = data['fileName']
        if 'filePath' in data:
            template.FilePath = data['filePath']
        
        db.session.commit()
        
        return jsonify(template.to_dict()), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@templates_bp.route('/<int:template_id>', methods=['DELETE'])
@require_auth
def delete_template(template_id):
    """Usuń szablon"""
    try:
        user_id = get_current_user_id()
        template = Template.query.filter_by(Id=template_id).first()
        
        if not template:
            return jsonify({'error': 'Szablon nie został znaleziony'}), 404
        
        db.session.delete(template)
        db.session.commit()
        
        return jsonify({'message': 'Szablon został usunięty'}), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@templates_bp.route('/<int:template_id>/duplicate', methods=['POST'])
@require_auth
def duplicate_template(template_id):
    """Sklonuj szablon"""
    try:
        user_id = get_current_user_id()
        original_template = Template.query.filter_by(Id=template_id).first()
        
        if not original_template:
            return jsonify({'error': 'Szablon nie został znaleziony'}), 404
        
        # Utwórz kopię szablonu
        new_template = Template(
            Name=f"{original_template.Name} (kopia)",
            FileName=original_template.FileName,
            FilePath=original_template.FilePath,
            UploadedAt=datetime.now()
        )
        
        db.session.add(new_template)
        db.session.commit()
        
        return jsonify(new_template.to_dict()), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@templates_bp.route('/<int:template_id>/render', methods=['POST'])
@require_auth
def render_template(template_id):
    """Renderuj szablon z podanymi zmiennymi"""
    try:
        user_id = get_current_user_id()
        template = Template.query.filter_by(Id=template_id).first()
        
        if not template:
            return jsonify({'error': 'Szablon nie został znaleziony'}), 404
        
        data = request.get_json()
        variables = data.get('variables', {})
        
        # Ponieważ model nie ma pola Content, zwróć informacje o pliku
        return jsonify({
            'message': 'Renderowanie szablonu wymaga odczytania pliku z FilePath',
            'template': template.to_dict(),
            'file_path': template.FilePath,
            'variables': variables
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@templates_bp.route('/upload', methods=['POST'])
@require_auth
def upload_template():
    """Prześlij plik szablonu"""
    try:
        user_id = get_current_user_id()
        
        # Sprawdź czy plik został przesłany
        if 'file' not in request.files:
            return jsonify({'error': 'Brak pliku'}), 400
        
        file = request.files['file']
        
        if file.filename == '':
            return jsonify({'error': 'Nie wybrano pliku'}), 400
        
        # Sprawdź rozszerzenie pliku
        allowed_extensions = {'docx', 'doc', 'pdf', 'txt'}
        if not ('.' in file.filename and 
                file.filename.rsplit('.', 1)[1].lower() in allowed_extensions):
            return jsonify({'error': 'Nieprawidłowy typ pliku. Dozwolone: docx, doc, pdf, txt'}), 400
        
        # Zabezpiecz nazwę pliku
        filename = secure_filename(file.filename)
        
        # Utwórz katalog uploads jeśli nie istnieje
        upload_folder = os.path.join(current_app.root_path, 'uploads', 'templates')
        os.makedirs(upload_folder, exist_ok=True)
        
        # Generuj unikalną nazwę pliku
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        unique_filename = f"{timestamp}_{filename}"
        filepath = os.path.join(upload_folder, unique_filename)
        
        # Zapisz plik
        file.save(filepath)
        
        # Pobierz dane z formularza
        template_name = request.form.get('name', filename.rsplit('.', 1)[0])
        
        # Utwórz rekord szablonu w bazie danych
        template = Template(
            Name=template_name,
            FileName=filename,
            FilePath=filepath,
            UploadedAt=datetime.now()
        )
        
        db.session.add(template)
        db.session.commit()
        
        return jsonify({
            'message': 'Plik został przesłany pomyślnie',
            'template': template.to_dict()
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@templates_bp.route('/categories', methods=['GET'])
@require_auth
def get_template_categories():
    """Pobierz wszystkie kategorie szablonów"""
    try:
        user_id = get_current_user_id()
        
        # Model nie ma pola category, więc zwracamy pustą listę
        category_list = []
        
        return jsonify(category_list), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@templates_bp.route('/types', methods=['GET'])
@require_auth
def get_template_types():
    """Pobierz wszystkie typy szablonów"""
    try:
        user_id = get_current_user_id()
        
        # Model nie ma pola Type, więc zwracamy podstawowe typy
        type_list = ['document', 'contract', 'invoice', 'report']
        
        return jsonify(type_list), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500
