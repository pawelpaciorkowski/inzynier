from flask import Blueprint, request, jsonify
from app.middleware import require_auth
from app.database import db
from app.models import Tag
from sqlalchemy import text

tags_bp = Blueprint('tags', __name__)

@tags_bp.route('/', methods=['GET'])
@require_auth
def get_tags():
    """Pobiera listę tagów, posortowaną od najnowszych (malejąco według ID)"""
    try:
        # Pobierz tagi, sortując od najnowszych (największe ID na początku)
        tags = Tag.query.order_by(Tag.Id.desc()).all()
        
        # Oblicz statystyki dla każdego tagu
        tags_with_stats = []
        for tag in tags:
            tag_dict = tag.to_dict()
            
            # Oblicz statystyki
            customer_count = db.session.execute(text("""
                SELECT COUNT(*) FROM CustomerTags WHERE TagId = :tag_id
            """), {'tag_id': tag.Id}).scalar() or 0
            
            invoice_count = db.session.execute(text("""
                SELECT COUNT(*) FROM InvoiceTags WHERE TagId = :tag_id
            """), {'tag_id': tag.Id}).scalar() or 0
            
            contract_count = db.session.execute(text("""
                SELECT COUNT(*) FROM ContractTags WHERE TagId = :tag_id
            """), {'tag_id': tag.Id}).scalar() or 0
            
            task_count = db.session.execute(text("""
                SELECT COUNT(*) FROM TaskTags WHERE TagId = :tag_id
            """), {'tag_id': tag.Id}).scalar() or 0
            
            meeting_count = db.session.execute(text("""
                SELECT COUNT(*) FROM MeetingTags WHERE TagId = :tag_id
            """), {'tag_id': tag.Id}).scalar() or 0
            
            tag_dict.update({
                'customerCount': customer_count,
                'invoiceCount': invoice_count,
                'contractCount': contract_count,
                'taskCount': task_count,
                'meetingCount': meeting_count
            })
            
            tags_with_stats.append(tag_dict)
        
        return jsonify(tags_with_stats), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@tags_bp.route('/', methods=['POST'])
@require_auth
def create_tag():
    """Tworzy nowy tag"""
    try:
        data = request.get_json()
        
        new_tag = Tag(
            Name=data.get('name'),
            Color=data.get('color', '#007bff')
        )
        
        db.session.add(new_tag)
        db.session.commit()
        
        return jsonify(new_tag.to_dict()), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@tags_bp.route('/<int:tag_id>', methods=['GET'])
@require_auth
def get_tag(tag_id):
    """Pobiera szczegóły tagu"""
    try:
        tag = Tag.query.get(tag_id)
        if not tag:
            return jsonify({'error': 'Tag nie znaleziony'}), 404
        
        return jsonify(tag.to_dict()), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@tags_bp.route('/<int:tag_id>', methods=['PUT'])
@require_auth
def update_tag(tag_id):
    """Aktualizuje tag"""
    try:
        tag = Tag.query.get(tag_id)
        if not tag:
            return jsonify({'error': 'Tag nie znaleziony'}), 404
        
        data = request.get_json()
        
        if 'name' in data:
            tag.Name = data['name']
        if 'color' in data:
            tag.Color = data['color']
        
        db.session.commit()
        
        return jsonify(tag.to_dict()), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@tags_bp.route('/<int:tag_id>', methods=['DELETE'])
@require_auth
def delete_tag(tag_id):
    """Usuwa tag"""
    try:
        tag = Tag.query.get(tag_id)
        if not tag:
            return jsonify({'error': 'Tag nie znaleziony'}), 404
        
        db.session.delete(tag)
        db.session.commit()
        
        return jsonify({'message': 'Tag usunięty'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500
