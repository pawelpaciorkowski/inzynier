from flask import Blueprint, request, jsonify
from app.middleware import require_auth, get_current_user_role, get_current_user, get_current_user_id
from app.database import db
from app.models import User, Role
from sqlalchemy import text

admin_bp = Blueprint('admin', __name__)

@admin_bp.route('/dashboard', methods=['GET'])
@require_auth
def get_dashboard():
    """Pobiera dane dashboardu administratora"""
    try:
        user = get_current_user()
        if not user:
            return jsonify({'error': 'Użytkownik nie znaleziony'}), 401
        
        # Sprawdź czy użytkownik ma uprawnienia administratora
        if user.role.name != 'Admin':
            return jsonify({'error': 'Brak uprawnień administratora'}), 403
        
        # Pobierz statystyki
        stats = db.session.execute(text("""
            SELECT 
                (SELECT COUNT(*) FROM users) as total_users,
                (SELECT COUNT(*) FROM Customers) as total_customers,
                (SELECT COUNT(*) FROM Invoices) as total_invoices,
                (SELECT COUNT(*) FROM Invoices WHERE IsPaid = 1) as paid_invoices,
                (SELECT COUNT(*) FROM Tasks) as total_tasks,
                (SELECT COUNT(*) FROM Tasks WHERE Completed = 0) as pending_tasks,
                (SELECT COUNT(*) FROM Contracts) as total_contracts,
                (SELECT COUNT(*) FROM Payments) as total_payments,
                (SELECT COUNT(*) FROM SystemLogs) as total_logs,
                (SELECT SUM(TotalAmount) FROM Invoices) as total_invoices_value
        """)).fetchone()
        
        # Pobierz zadania na użytkownika
        task_per_user = db.session.execute(text("""
            SELECT 
                u.username,
                COUNT(t.Id) as task_count,
                SUM(CASE WHEN t.Completed = 0 THEN 1 ELSE 0 END) as pending_count
            FROM users u
            LEFT JOIN Tasks t ON u.id = t.UserId
            GROUP BY u.id, u.username
            ORDER BY task_count DESC
        """)).fetchall()
        
        task_per_user_data = []
        for row in task_per_user:
            task_per_user_data.append({
                'username': row[0],
                'totalTasks': row[1],
                'pendingTasks': row[2]
            })
        
        return jsonify({
            'usersCount': stats[0],
            'totalCustomers': stats[1],
            'invoicesCount': stats[2],
            'paidInvoices': stats[3],
            'tasksCount': stats[4],
            'pendingTasks': stats[5],
            'contractsCount': stats[6],
            'paymentsCount': stats[7],
            'systemLogsCount': stats[8],
            'totalInvoicesValue': float(stats[9] or 0),
            'taskPerUser': task_per_user_data
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@admin_bp.route('/users', methods=['GET'])
@require_auth
def get_users():
    """Pobiera listę użytkowników"""
    try:
        user = get_current_user()
        if not user:
            return jsonify({'error': 'Użytkownik nie znaleziony'}), 401
        
        # Sprawdź czy użytkownik ma uprawnienia administratora
        if user.role.name != 'Admin':
            return jsonify({'error': 'Brak uprawnień administratora'}), 403
        
        users = User.query.all()
        return jsonify([user.to_dict() for user in users]), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@admin_bp.route('/users', methods=['POST'])
@require_auth
def create_user():
    """Tworzy nowego użytkownika (tylko dla administratora)"""
    try:
        user = get_current_user()
        if not user:
            return jsonify({'error': 'Użytkownik nie znaleziony'}), 401
        
        # Sprawdź czy użytkownik ma uprawnienia administratora
        if user.role.name != 'Admin':
            return jsonify({'error': 'Brak uprawnień administratora'}), 403
        
        data = request.get_json()
        username = data.get('username')
        email = data.get('email')
        password = data.get('password')
        role_id = data.get('role_id', 2)  # Domyślnie User
        
        if not username or not email or not password:
            return jsonify({'error': 'Brak wymaganych danych'}), 400
        
        # Sprawdź czy użytkownik już istnieje
        if User.query.filter_by(username=username).first():
            return jsonify({'error': 'Użytkownik o tej nazwie już istnieje'}), 400
        
        if User.query.filter_by(email=email).first():
            return jsonify({'error': 'Użytkownik o tym emailu już istnieje'}), 400
        
        # Utwórz nowego użytkownika
        from werkzeug.security import generate_password_hash
        new_user = User(
            username=username,
            email=email,
            password_hash=generate_password_hash(password),
            role_id=role_id
        )
        
        db.session.add(new_user)
        db.session.commit()
        
        return jsonify({'message': 'Użytkownik został utworzony', 'user': new_user.to_dict()}), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@admin_bp.route('/users/<int:user_id>', methods=['PUT'])
@require_auth
def update_user(user_id):
    """Aktualizuje użytkownika"""
    try:
        user = get_current_user()
        if not user:
            return jsonify({'error': 'Użytkownik nie znaleziony'}), 401
        
        # Sprawdź czy użytkownik ma uprawnienia administratora
        if user.role.name != 'Admin':
            return jsonify({'error': 'Brak uprawnień administratora'}), 403
        
        target_user = User.query.get(user_id)
        if not target_user:
            return jsonify({'error': 'Użytkownik nie znaleziony'}), 404
        
        data = request.get_json()
        
        if 'username' in data:
            target_user.username = data['username']
        if 'email' in data:
            target_user.email = data['email']
        if 'role_id' in data:
            target_user.role_id = data['role_id']
        
        db.session.commit()
        
        return jsonify(target_user.to_dict()), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@admin_bp.route('/users/<int:user_id>', methods=['DELETE'])
@require_auth
def delete_user(user_id):
    """Usuwa użytkownika (soft delete)"""
    try:
        user = get_current_user()
        if not user:
            return jsonify({'error': 'Użytkownik nie znaleziony'}), 401
        
        # Sprawdź czy użytkownik ma uprawnienia administratora
        if user.role.name != 'Admin':
            return jsonify({'error': 'Brak uprawnień administratora'}), 403
        
        target_user = User.query.get(user_id)
        if not target_user:
            return jsonify({'error': 'Użytkownik nie znaleziony'}), 404
        
        # Nie można usunąć samego siebie
        if target_user.id == user.id:
            return jsonify({'error': 'Nie można usunąć samego siebie'}), 400
        
        # Soft delete by updating role to inactive (or just remove the user)
        db.session.delete(target_user)
        db.session.commit()
        
        return jsonify({'message': 'Użytkownik usunięty'}), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@admin_bp.route('/Roles', methods=['POST'])
@require_auth
def create_role():
    """Tworzy nową rolę (tylko dla administratora)"""
    try:
        user = get_current_user()
        if not user:
            return jsonify({'error': 'Użytkownik nie znaleziony'}), 401
        
        # Sprawdź czy użytkownik ma uprawnienia administratora
        if user.role.name != 'Admin':
            return jsonify({'error': 'Brak uprawnień administratora'}), 403
        
        data = request.get_json()
        name = data.get('name')
        description = data.get('description')
        
        if not name:
            return jsonify({'error': 'Nazwa roli jest wymagana'}), 400
        
        # Sprawdź czy rola już istnieje
        if Role.query.filter_by(name=name).first():
            return jsonify({'error': 'Rola o tej nazwie już istnieje'}), 400
        
        # Utwórz nową rolę
        new_role = Role(
            name=name,
            Description=description
        )
        
        db.session.add(new_role)
        db.session.commit()
        
        return jsonify({'message': 'Rola została utworzona', 'role': new_role.to_dict()}), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@admin_bp.route('/Roles', methods=['GET'])
@require_auth
def get_roles():
    """Pobiera listę ról"""
    try:
        user = get_current_user()
        if not user:
            return jsonify({'error': 'Użytkownik nie znaleziony'}), 401
        
        # Sprawdź czy użytkownik ma uprawnienia administratora
        if user.role.name != 'Admin':
            return jsonify({'error': 'Brak uprawnień administratora'}), 403
        
        roles = Role.query.all()
        return jsonify([role.to_dict() for role in roles]), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@admin_bp.route('/Roles/<int:role_id>', methods=['PUT'])
@require_auth
def update_role(role_id):
    """Aktualizuje rolę"""
    try:
        user = get_current_user()
        if not user:
            return jsonify({'error': 'Użytkownik nie znaleziony'}), 401
        
        # Sprawdź czy użytkownik ma uprawnienia administratora
        if user.role.name != 'Admin':
            return jsonify({'error': 'Brak uprawnień administratora'}), 403
        
        role = Role.query.get(role_id)
        if not role:
            return jsonify({'error': 'Rola nie znaleziona'}), 404
        
        data = request.get_json()
        
        if 'name' in data:
            role.name = data['name']
        if 'description' in data:
            role.Description = data['description']
        
        db.session.commit()
        
        return jsonify(role.to_dict()), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@admin_bp.route('/Roles/<int:role_id>', methods=['DELETE'])
@require_auth
def delete_role(role_id):
    """Usuwa rolę (tylko dla administratora)"""
    try:
        user = get_current_user()
        if not user:
            return jsonify({'error': 'Użytkownik nie znaleziony'}), 401
        
        # Sprawdź czy użytkownik ma uprawnienia administratora
        if user.role.name != 'Admin':
            return jsonify({'error': 'Brak uprawnień administratora'}), 403
        
        role = Role.query.get(role_id)
        if not role:
            return jsonify({'error': 'Rola nie znaleziona'}), 404
        
        # Sprawdź czy rola nie jest używana przez użytkowników
        users_with_role = User.query.filter_by(role_id=role_id).count()
        if users_with_role > 0:
            return jsonify({'error': f'Nie można usunąć roli używanej przez {users_with_role} użytkowników'}), 400
        
        # Usuń rolę
        db.session.delete(role)
        db.session.commit()
        
        return jsonify({'message': 'Rola została usunięta'}), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@admin_bp.route('/tasks', methods=['GET'])
@require_auth
def get_all_tasks():
    """Pobiera wszystkie zadania (tylko dla administratora)"""
    try:
        user = get_current_user()
        if not user:
            return jsonify({'error': 'Użytkownik nie znaleziony'}), 401
        
        # Sprawdź czy użytkownik ma uprawnienia administratora
        if user.role.name != 'Admin':
            return jsonify({'error': 'Brak uprawnień administratora'}), 403
        
        # Pobierz wszystkie zadania z JOIN do tabel Users i Customers
        tasks = db.session.execute(text("""
            SELECT 
                t.Id, t.Title, t.Description, t.DueDate, t.Completed,
                u.username,
                c.Name as customer_name
            FROM Tasks t
            LEFT JOIN users u ON t.UserId = u.id
            LEFT JOIN Customers c ON t.CustomerId = c.Id
            ORDER BY t.DueDate ASC, t.Id DESC
        """)).fetchall()
        
        result = []
        for row in tasks:
            # Debug: sprawdź typ due_date
            due_date_value = None
            if row[3]:
                if hasattr(row[3], 'isoformat'):
                    due_date_value = row[3].isoformat()
                else:
                    due_date_value = str(row[3])
            
            result.append({
                'id': row[0],
                'title': row[1],
                'description': row[2],
                'dueDate': due_date_value,
                'completed': bool(row[4]),
                'user': {
                    'username': row[5] if row[5] else 'Unknown'
                },
                'customer': {
                    'name': row[6] if row[6] else None
                } if row[6] else None
            })
        
        return jsonify(result), 200
        
    except Exception as e:
        import traceback
        print(f"Błąd w get_all_tasks: {str(e)}")
        print(f"Traceback: {traceback.format_exc()}")
        return jsonify({'error': str(e)}), 500

@admin_bp.route('/Roles/<int:role_id>/users', methods=['GET'])
@require_auth
def get_users_by_role(role_id):
    """Pobiera użytkowników należących do danej roli"""
    try:
        user = get_current_user()
        if not user:
            return jsonify({'error': 'Użytkownik nie znaleziony'}), 401
        
        # Sprawdź czy użytkownik ma uprawnienia administratora
        if user.role.name != 'Admin':
            return jsonify({'error': 'Brak uprawnień administratora'}), 403
        
        # Sprawdź czy rola istnieje
        role = Role.query.get(role_id)
        if not role:
            return jsonify({'error': 'Rola nie znaleziona'}), 404
        
        # Pobierz użytkowników z tą rolą
        users = db.session.execute(text("""
            SELECT u.id, u.username, u.email
            FROM users u
            WHERE u.role_id = :role_id
            ORDER BY u.username ASC
        """), {'role_id': role_id}).fetchall()
        
        result = []
        for row in users:
            result.append({
                'id': row[0],
                'username': row[1],
                'email': row[2]
            })
        
        return jsonify({
            'role': role.to_dict(),
            'users': result,
            'count': len(result)
        }), 200
        
    except Exception as e:
        import traceback
        print(f"Błąd w get_users_by_role: {str(e)}")
        print(f"Traceback: {traceback.format_exc()}")
        return jsonify({'error': str(e)}), 500
