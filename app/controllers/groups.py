from flask import Blueprint, request, jsonify
from app.middleware import require_auth
from app.database import db
from app.models import Group

groups_bp = Blueprint('groups', __name__)

@groups_bp.route('/', methods=['GET'])
@require_auth
def get_groups():
    """Pobiera listę grup"""
    try:
        groups = Group.query.all()
        return jsonify([group.to_dict() for group in groups]), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@groups_bp.route('/', methods=['POST'])
@require_auth
def create_group():
    """Tworzy nową grupę"""
    try:
        data = request.get_json()
        
        new_group = Group(
            Name=data.get('name'),
            Description=data.get('description')
        )
        
        db.session.add(new_group)
        db.session.commit()
        
        return jsonify(new_group.to_dict()), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@groups_bp.route('/<int:group_id>', methods=['GET'])
@require_auth
def get_group(group_id):
    """Pobiera szczegóły grupy z członkami"""
    try:
        group = Group.query.get(group_id)
        if not group:
            return jsonify({'error': 'Grupa nie znaleziona'}), 404
        
        # Pobierz członków grupy z tabeli UserGroups
        from sqlalchemy import text
        members_query = text("""
            SELECT u.id, u.username, u.email 
            FROM users u 
            INNER JOIN UserGroups ug ON u.id = ug.UserId 
            WHERE ug.GroupId = :group_id
        """)
        
        members_result = db.session.execute(members_query, {'group_id': group_id}).fetchall()
        members = [{'id': row[0], 'username': row[1], 'email': row[2]} for row in members_result]
        
        # Pobierz przypisanych klientów
        customers_query = text("""
            SELECT c.Id, c.Name, c.Email 
            FROM Customers c 
            WHERE c.AssignedGroupId = :group_id
        """)
        
        customers_result = db.session.execute(customers_query, {'group_id': group_id}).fetchall()
        assigned_customers = [{'id': row[0], 'name': row[1], 'email': row[2]} for row in customers_result]
        
        # Pobierz statystyki
        stats_query = text("""
            SELECT 
                (SELECT COUNT(*) FROM UserGroups WHERE GroupId = :group_id) as member_count,
                (SELECT COUNT(*) FROM Customers WHERE AssignedGroupId = :group_id) as customer_count,
                (SELECT COUNT(*) FROM Tasks WHERE AssignedGroupId = :group_id) as task_count,
                (SELECT COUNT(*) FROM Contracts WHERE ResponsibleGroupId = :group_id) as contract_count,
                (SELECT COUNT(*) FROM Invoices WHERE AssignedGroupId = :group_id) as invoice_count,
                (SELECT COUNT(*) FROM Meetings WHERE AssignedGroupId = :group_id) as meeting_count
        """)
        
        stats_result = db.session.execute(stats_query, {'group_id': group_id}).fetchone()
        
        # Przygotuj odpowiedź
        group_data = group.to_dict()
        group_data.update({
            'members': members,
            'assignedCustomers': assigned_customers,
            'memberCount': stats_result[0] if stats_result else 0,
            'customerCount': stats_result[1] if stats_result else 0,
            'taskCount': stats_result[2] if stats_result else 0,
            'contractCount': stats_result[3] if stats_result else 0,
            'invoiceCount': stats_result[4] if stats_result else 0,
            'meetingCount': stats_result[5] if stats_result else 0
        })
        
        return jsonify(group_data), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@groups_bp.route('/<int:group_id>', methods=['PUT'])
@require_auth
def update_group(group_id):
    """Aktualizuje grupę"""
    try:
        group = Group.query.get(group_id)
        if not group:
            return jsonify({'error': 'Grupa nie znaleziona'}), 404
        
        data = request.get_json()
        
        if 'name' in data:
            group.Name = data['name']
        if 'description' in data:
            group.Description = data['description']
        
        db.session.commit()
        
        return jsonify(group.to_dict()), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@groups_bp.route('/<int:group_id>', methods=['DELETE'])
@require_auth
def delete_group(group_id):
    """Usuwa grupę"""
    try:
        group = Group.query.get(group_id)
        if not group:
            return jsonify({'error': 'Grupa nie znaleziona'}), 404
        
        db.session.delete(group)
        db.session.commit()
        
        return jsonify({'message': 'Grupa usunięta'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@groups_bp.route('/<int:group_id>/members/<int:user_id>', methods=['POST'])
@require_auth
def add_group_member(group_id, user_id):
    """Dodaje użytkownika do grupy"""
    try:
        group = Group.query.get(group_id)
        if not group:
            return jsonify({'error': 'Grupa nie znaleziona'}), 404
        
        # Sprawdź czy użytkownik istnieje
        from app.models import User
        user = User.query.get(user_id)
        if not user:
            return jsonify({'error': 'Użytkownik nie znaleziony'}), 404
        
        # Sprawdź czy użytkownik już jest w grupie
        from sqlalchemy import text
        existing_query = text("SELECT COUNT(*) FROM UserGroups WHERE UserId = :user_id AND GroupId = :group_id")
        existing_result = db.session.execute(existing_query, {'user_id': user_id, 'group_id': group_id}).fetchone()
        
        if existing_result[0] > 0:
            return jsonify({'error': 'Użytkownik już jest członkiem tej grupy'}), 400
        
        # Dodaj użytkownika do grupy
        insert_query = text("INSERT INTO UserGroups (UserId, GroupId) VALUES (:user_id, :group_id)")
        db.session.execute(insert_query, {'user_id': user_id, 'group_id': group_id})
        db.session.commit()
        
        return jsonify({'message': f'Użytkownik {user.username} został dodany do grupy {group.Name}'}), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@groups_bp.route('/<int:group_id>/members/<int:user_id>', methods=['DELETE'])
@require_auth
def remove_group_member(group_id, user_id):
    """Usuwa użytkownika z grupy"""
    try:
        group = Group.query.get(group_id)
        if not group:
            return jsonify({'error': 'Grupa nie znaleziona'}), 404
        
        # Sprawdź czy użytkownik jest w grupie
        from sqlalchemy import text
        existing_query = text("SELECT COUNT(*) FROM UserGroups WHERE UserId = :user_id AND GroupId = :group_id")
        existing_result = db.session.execute(existing_query, {'user_id': user_id, 'group_id': group_id}).fetchone()
        
        if existing_result[0] == 0:
            return jsonify({'error': 'Użytkownik nie jest członkiem tej grupy'}), 400
        
        # Usuń użytkownika z grupy
        delete_query = text("DELETE FROM UserGroups WHERE UserId = :user_id AND GroupId = :group_id")
        db.session.execute(delete_query, {'user_id': user_id, 'group_id': group_id})
        db.session.commit()
        
        return jsonify({'message': 'Użytkownik został usunięty z grupy'}), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@groups_bp.route('/<int:group_id>/customers/<int:customer_id>', methods=['POST'])
@require_auth
def add_group_customer(group_id, customer_id):
    """Przypisuje klienta do grupy"""
    try:
        group = Group.query.get(group_id)
        if not group:
            return jsonify({'error': 'Grupa nie znaleziona'}), 404
        
        # Sprawdź czy klient istnieje
        from sqlalchemy import text
        customer_query = text("SELECT Id, Name FROM Customers WHERE Id = :customer_id")
        customer_result = db.session.execute(customer_query, {'customer_id': customer_id}).fetchone()
        
        if not customer_result:
            return jsonify({'error': 'Klient nie znaleziony'}), 404
        
        # Sprawdź czy klient już jest przypisany do jakiejś grupy
        existing_query = text("SELECT AssignedGroupId FROM Customers WHERE Id = :customer_id")
        existing_result = db.session.execute(existing_query, {'customer_id': customer_id}).fetchone()
        
        if existing_result and existing_result[0] is not None:
            return jsonify({'error': 'Klient już jest przypisany do innej grupy'}), 400
        
        # Przypisz klienta do grupy
        update_query = text("UPDATE Customers SET AssignedGroupId = :group_id WHERE Id = :customer_id")
        db.session.execute(update_query, {'group_id': group_id, 'customer_id': customer_id})
        db.session.commit()
        
        return jsonify({'message': f'Klient {customer_result[1]} został przypisany do grupy {group.Name}'}), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@groups_bp.route('/<int:group_id>/customers/<int:customer_id>', methods=['DELETE'])
@require_auth
def remove_group_customer(group_id, customer_id):
    """Usuwa klienta z grupy"""
    try:
        group = Group.query.get(group_id)
        if not group:
            return jsonify({'error': 'Grupa nie znaleziona'}), 404
        
        # Sprawdź czy klient jest przypisany do tej grupy
        from sqlalchemy import text
        existing_query = text("SELECT AssignedGroupId FROM Customers WHERE Id = :customer_id")
        existing_result = db.session.execute(existing_query, {'customer_id': customer_id}).fetchone()
        
        if not existing_result or existing_result[0] != group_id:
            return jsonify({'error': 'Klient nie jest przypisany do tej grupy'}), 400
        
        # Usuń przypisanie klienta do grupy
        update_query = text("UPDATE Customers SET AssignedGroupId = NULL WHERE Id = :customer_id")
        db.session.execute(update_query, {'customer_id': customer_id})
        db.session.commit()
        
        return jsonify({'message': 'Klient został usunięty z grupy'}), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@groups_bp.route('/<int:group_id>/statistics', methods=['GET'])
@require_auth
def get_group_statistics(group_id):
    """Pobiera szczegółowe statystyki grupy"""
    try:
        group = Group.query.get(group_id)
        if not group:
            return jsonify({'error': 'Grupa nie znaleziona'}), 404
        
        from app.database import db
        from sqlalchemy import text
        
        # Pobierz szczegółowe statystyki dla grupy
        stats = db.session.execute(text("""
            SELECT 
                (SELECT COUNT(*) FROM UserGroups WHERE GroupId = :group_id) as total_members,
                (SELECT COUNT(*) FROM Customers WHERE AssignedGroupId = :group_id) as total_customers,
                (SELECT COUNT(*) FROM Tasks WHERE AssignedGroupId = :group_id) as total_tasks,
                (SELECT COUNT(*) FROM Tasks WHERE AssignedGroupId = :group_id AND Completed = 1) as completed_tasks,
                (SELECT COUNT(*) FROM Tasks WHERE AssignedGroupId = :group_id AND Completed = 0) as pending_tasks,
                (SELECT COUNT(*) FROM Contracts WHERE ResponsibleGroupId = :group_id) as total_contracts,
                (SELECT COUNT(*) FROM Invoices WHERE AssignedGroupId = :group_id) as total_invoices,
                (SELECT COUNT(*) FROM Invoices WHERE AssignedGroupId = :group_id AND IsPaid = 1) as paid_invoices,
                (SELECT COUNT(*) FROM Invoices WHERE AssignedGroupId = :group_id AND IsPaid = 0) as unpaid_invoices,
                (SELECT COUNT(*) FROM Meetings WHERE AssignedGroupId = :group_id) as total_meetings,
                (SELECT COUNT(*) FROM Meetings WHERE AssignedGroupId = :group_id AND ScheduledAt > NOW()) as upcoming_meetings
        """), {'group_id': group_id}).fetchone()
        
        return jsonify({
            'groupId': group_id,
            'groupName': group.Name,
            'totalMembers': stats[0] if stats else 0,
            'totalCustomers': stats[1] if stats else 0,
            'totalTasks': stats[2] if stats else 0,
            'completedTasks': stats[3] if stats else 0,
            'pendingTasks': stats[4] if stats else 0,
            'totalContracts': stats[5] if stats else 0,
            'totalInvoices': stats[6] if stats else 0,
            'paidInvoices': stats[7] if stats else 0,
            'unpaidInvoices': stats[8] if stats else 0,
            'totalMeetings': stats[9] if stats else 0,
            'upcomingMeetings': stats[10] if stats else 0
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500