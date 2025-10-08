from flask import Blueprint, request, jsonify
from app.middleware import require_auth, get_current_user_id
from app.database import db
from app.models import Task, User, Customer
from sqlalchemy import text
from datetime import datetime

user_tasks_bp = Blueprint('user_tasks', __name__)

@user_tasks_bp.route('/tasks', methods=['POST'])
@require_auth
def create_task():
    """Tworzy nowe zadanie"""
    try:
        user_id = get_current_user_id()
        data = request.get_json()
        
        # Utwórz nowe zadanie używając modelu
        new_task = Task(
            Title=data.get('title'),
            Description=data.get('description'),
            DueDate=datetime.fromisoformat(data.get('dueDate').replace('Z', '')) if data.get('dueDate') else None,
            Completed=False,
            UserId=user_id,
            CustomerId=data.get('customerId') or 1
        )
        
        db.session.add(new_task)
        db.session.commit()
        
        # Zwróć utworzone zadanie
        result = {
            'id': new_task.Id,
            'title': new_task.Title,
            'description': new_task.Description,
            'dueDate': new_task.DueDate.isoformat() if new_task.DueDate else None,
            'completed': new_task.Completed,
            'userId': new_task.UserId,
            'customerId': new_task.CustomerId,
            'assignedGroupId': new_task.AssignedGroupId
        }
        
        # Dodaj powiadomienie dla użytkownika (opcjonalnie)
        try:
            from app.controllers.notifications import create_notification
            create_notification(
                user_id=user_id,
                message=f'Utworzono nowe zadanie: {data.get("title")}'
            )
        except Exception as e:
            print(f"Błąd przy tworzeniu powiadomienia: {e}")
        
        # Dodaj aktywność (automatyczne logowanie akcji)
        try:
            from app.models import Activity
            
            activity = Activity(
                Note=f'Utworzono nowe zadanie: {data.get("title", "Bez tytułu")}',
                CreatedAt=datetime.now(),
                UserId=user_id,
                CustomerId=data.get('customerId') if data.get('customerId') else None
            )
            db.session.add(activity)
        except Exception as e:
            print(f"Błąd przy tworzeniu aktywności: {e}")
        
        # Dodaj log systemowy (opcjonalnie)
        try:
            from app.controllers.logs import log_system_event
            log_system_event(
                level='Information',
                message=f'Zadanie zostało utworzone',
                source='Python.Backend.TasksController',
                user_id=user_id,
                details=f'{{"title": "{data.get("title")}", "dueDate": "{data.get("dueDate")}"}}'
            )
        except Exception as e:
            print(f"Błąd przy tworzeniu logu: {e}")
        
        return jsonify(result), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@user_tasks_bp.route('/tasks', methods=['GET'])
@require_auth
def get_tasks():
    """Pobiera listę zadań użytkownika"""
    try:
        user_id = get_current_user_id()
        
        # Pobierz zadania z JOIN do tabel Users i Customers
        tasks = db.session.execute(text("""
            SELECT 
                t.Id, t.Title, t.Description, t.DueDate, t.Completed,
                u.username,
                c.Name as customer_name
            FROM Tasks t
            LEFT JOIN users u ON t.UserId = u.id
            LEFT JOIN Customers c ON t.CustomerId = c.Id
            WHERE t.UserId = :user_id
            ORDER BY t.DueDate ASC, t.Id DESC
        """), {'user_id': user_id}).fetchall()
        
        result = []
        for row in tasks:
            # Pobierz dane użytkownika
            user_data = (row[5],) if row[5] else None
            
            # Pobierz dane klienta
            customer_data = (row[6],) if row[6] else None
            
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
                    'username': user_data[0] if user_data else 'Unknown'
                },
                'customer': {
                    'name': customer_data[0] if customer_data else None
                } if customer_data else None
            })
        
        return jsonify(result), 200
        
    except Exception as e:
        import traceback
        print(f"Błąd w get_tasks: {str(e)}")
        print(f"Traceback: {traceback.format_exc()}")
        return jsonify({'error': str(e)}), 500

@user_tasks_bp.route('/tasks/<int:task_id>', methods=['GET'])
@require_auth
def get_task(task_id):
    """Pobiera szczegóły pojedynczego zadania"""
    try:
        user_id = get_current_user_id()

        # Pobierz zadanie z JOIN do tabel Users i Customers
        task_data = db.session.execute(text("""
            SELECT
                t.Id, t.Title, t.Description, t.DueDate, t.Completed, t.CustomerId,
                u.username,
                c.Name as customer_name
            FROM Tasks t
            LEFT JOIN users u ON t.UserId = u.id
            LEFT JOIN Customers c ON t.CustomerId = c.Id
            WHERE t.Id = :task_id AND t.UserId = :user_id
        """), {'task_id': task_id, 'user_id': user_id}).fetchone()

        if not task_data:
            return jsonify({'error': 'Zadanie nie znalezione'}), 404

        # Formatuj datę
        due_date_value = None
        if task_data[3]:
            if hasattr(task_data[3], 'isoformat'):
                due_date_value = task_data[3].isoformat()
            else:
                due_date_value = str(task_data[3])

        result = {
            'id': task_data[0],
            'title': task_data[1],
            'description': task_data[2],
            'dueDate': due_date_value,
            'completed': bool(task_data[4]),
            'customerId': task_data[5],
            'user': {
                'username': task_data[6] if task_data[6] else 'Unknown'
            },
            'customer': {
                'name': task_data[7] if task_data[7] else None
            } if task_data[7] else None
        }

        return jsonify(result), 200

    except Exception as e:
        import traceback
        print(f"Błąd w get_task: {str(e)}")
        print(f"Traceback: {traceback.format_exc()}")
        return jsonify({'error': str(e)}), 500

@user_tasks_bp.route('/tasks/<int:task_id>', methods=['PUT'])
@require_auth
def update_task(task_id):
    """Aktualizuje zadanie"""
    try:
        user_id = get_current_user_id()
        data = request.get_json()
        
        # Znajdź zadanie
        task = Task.query.filter_by(Id=task_id, UserId=user_id).first()
        if not task:
            return jsonify({'error': 'Zadanie nie znalezione'}), 404
        
        # Aktualizuj pola
        if 'title' in data:
            task.Title = data['title']
        if 'description' in data:
            task.Description = data['description']
        if 'dueDate' in data:
            task.DueDate = datetime.fromisoformat(data['dueDate'].replace('Z', '')) if data['dueDate'] else None
        if 'completed' in data:
            task.Completed = data['completed']
        
        db.session.commit()
        
        return jsonify({'message': 'Zadanie zaktualizowane'}), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@user_tasks_bp.route('/tasks/<int:task_id>', methods=['DELETE'])
@require_auth
def delete_task(task_id):
    """Usuwa zadanie"""
    try:
        user_id = get_current_user_id()
        
        # Znajdź zadanie
        task = Task.query.filter_by(Id=task_id, UserId=user_id).first()
        if not task:
            return jsonify({'error': 'Zadanie nie znalezione'}), 404
        
        db.session.delete(task)
        db.session.commit()
        
        return jsonify({'message': 'Zadanie usunięte'}), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500