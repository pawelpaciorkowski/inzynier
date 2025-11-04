-- Skrypt SQL do dodania użytkownika admin
-- UWAGA: Hasło musi być zahashowane przez werkzeug.security.generate_password_hash()

-- 1. Dodaj rolę Admin (jeśli nie istnieje)
INSERT INTO roles (name, Description)
SELECT 'Admin', 'Administrator systemu z pełnymi uprawnieniami'
WHERE NOT EXISTS (SELECT 1 FROM roles WHERE name = 'Admin');

-- 2. Dodaj użytkownika admin
-- UWAGA: Ten hash jest specyficzny dla hasła "Diviruse007@" wygenerowany przez werkzeug
-- Jeśli chcesz zmienić hasło, musisz wygenerować nowy hash przez Python:
-- from werkzeug.security import generate_password_hash
-- print(generate_password_hash('TwojeNoweHaslo'))

INSERT INTO users (username, email, password_hash, role_id)
SELECT 
    'admin',
    'admin@crm.local',
    (SELECT password_hash FROM users WHERE username = 'admin' LIMIT 1),
    (SELECT id FROM roles WHERE name = 'Admin')
WHERE NOT EXISTS (SELECT 1 FROM users WHERE username = 'admin');

-- Sprawdź użytkowników
SELECT u.id, u.username, u.email, r.name as role 
FROM users u 
LEFT JOIN roles r ON u.role_id = r.id;













