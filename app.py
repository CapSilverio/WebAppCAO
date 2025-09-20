from flask import Flask, render_template, request, redirect, url_for, session, jsonify, make_response
import pandas as pd
import io
import sqlite3
import bcrypt
import random
import os
import json

app = Flask(__name__)
app.secret_key = 'your_secret_key'  # Change this to a random secret key


# --- Dados Iniciais (serão a fonte para reset) ---
def get_initial_unidades():
    unidades = [
        # CMA
        {'id': 1, 'nome': '7º BEC', 'cidade': 'Rio Branco-AC', 'lat': -9.9660, 'lon': -67.8257, 'vagas': 0},
        {'id': 2, 'nome': '5º BEC', 'cidade': 'Porto Velho-RO', 'lat': -8.7840, 'lon': -63.9038, 'vagas': 0},
        {'id': 3, 'nome': '6º BEC', 'cidade': 'Boa Vista-RR', 'lat': 2.8270, 'lon': -60.6832, 'vagas': 0},
        {'id': 4, 'nome': '21ª Cia E Cnst', 'cidade': 'São Gabriel da Cachoeira-AM', 'lat': -0.1303, 'lon': -67.089, 'vagas': 0},
        # CMN
        {'id': 5, 'nome': '8º BEC', 'cidade': 'Santarém-PA', 'lat': -2.4431, 'lon': -54.7081, 'vagas': 0},
        {'id': 6, 'nome': '6ª Cia E Cmb Sl', 'cidade': 'Marabá-PA', 'lat': -5.36997, 'lon': -49.1169, 'vagas': 0},
        # CMNE
        {'id': 7, 'nome': '2º BEC', 'cidade': 'Teresina-PI', 'lat': -5.0892, 'lon': -42.8016, 'vagas': 0},
        {'id': 8, 'nome': '3º BEC', 'cidade': 'Picos-PI', 'lat': -7.0761, 'lon': -41.4672, 'vagas': 0},
        {'id': 9, 'nome': '1º BEC', 'cidade': 'Caicó-RN', 'lat': -6.4592, 'lon': -37.0958, 'vagas': 0},
        {'id': 10, 'nome': '7º BE Cmb', 'cidade': 'Natal-RN', 'lat': -5.7945, 'lon': -35.211, 'vagas': 0},
        {'id': 11, 'nome': '10ª Cia E Cmb', 'cidade': 'São Bento do Una-PE', 'lat': -8.5225, 'lon': -36.5503, 'vagas': 0},
        {'id': 12, 'nome': '4º BEC', 'cidade': 'Barreiras-BA', 'lat': -12.1478, 'lon': -44.9961, 'vagas': 0},
        # CML
        {'id': 13, 'nome': '4º BE Cmb', 'cidade': 'Itajubá-MG', 'lat': -22.4219, 'lon': -45.4531, 'vagas': 0},
        {'id': 15, 'nome': 'Cia E Cmb Pqdt', 'cidade': 'Rio de Janeiro-RJ', 'lat': -22.9068, 'lon': -43.1729, 'vagas': 0},
        {'id': 16, 'nome': '1º BE Cmb', 'cidade': 'Rio de Janeiro-RJ', 'lat': -22.9068, 'lon': -43.1729, 'vagas': 0},
        {'id': 34, 'nome': 'EsSA', 'cidade': 'Três Corações-MG', 'lat': -21.7047, 'lon':-45.2566, 'vagas': 1},
        {'id': 35, 'nome': 'EsAO', 'cidade': 'Rio de Janeiro-RJ', 'lat': -22.8666, 'lon': -43.401, 'vagas': 1},
        {'id': 36, 'nome': 'AMAN', 'cidade': 'Resende-RJ', 'lat': -22.4536, 'lon': -44.4496, 'vagas': 1},
        # CMP
        {'id': 14, 'nome': '2º BFv', 'cidade': 'Araguari-MG', 'lat': -18.6481, 'lon': -48.1879, 'vagas': 0},
        {'id': 30, 'nome': '23ª Cia E Cmb Mec', 'cidade': 'Ipameri-GO', 'lat': -17.7219, 'lon': -48.1597, 'vagas': 0},
        # CMSE
        {'id': 17, 'nome': '2º BE Cmb', 'cidade': 'Pindamonhangaba-SP', 'lat': -22.9243, 'lon': -45.4666, 'vagas': 0},
        {'id': 18, 'nome': '11ª Cia E Cmb L', 'cidade': 'Pindamonhangaba-SP', 'lat': -22.9418, 'lon': -45.4551, 'vagas': 0},
        {'id': 19, 'nome': 'Cia E Amv', 'cidade': 'Pindamonhangaba-SP', 'lat': -22.9412, 'lon': -45.4538, 'vagas': 0},
        {'id': 37, 'nome': 'CAVEx', 'cidade': 'Taubaté-SP', 'lat': -23.0447, 'lon': -45.5266, 'vagas':2},
        # CMS
        {'id': 20, 'nome': '15ª Cia E Cmb Mec', 'cidade': 'Palmas-PR', 'lat': -26.4842, 'lon': -51.9919, 'vagas': 0},
        {'id': 21, 'nome': '5º BE Cmb Bld', 'cidade': 'Porto União-SC', 'lat': -26.2397, 'lon': -51.0788, 'vagas': 0},
        {'id': 22, 'nome': '1º BFv', 'cidade': 'Lages-SC', 'lat': -27.815, 'lon': -50.3264, 'vagas': 0},
        {'id': 23, 'nome': '14ª Cia E Cmb', 'cidade': 'Tubarão-SC', 'lat': -28.4667, 'lon': -49.0069, 'vagas': 0},
        {'id': 24, 'nome': '1ª Cia E Cmb Mec', 'cidade': 'São Borja-RS', 'lat': -28.6614, 'lon': -56.0039, 'vagas': 0},
        {'id': 25, 'nome': '2ª Cia E Cmb Mec', 'cidade': 'Alegrete-RS', 'lat': -29.7831, 'lon': -55.7919, 'vagas': 0},
        {'id': 26, 'nome': '12º BE Cmb Bld', 'cidade': 'Alegrete-RS', 'lat': -29.7831, 'lon': -55.7919, 'vagas': 0},
        {'id': 27, 'nome': '3º BE Cmb', 'cidade': 'Cachoeira do Sul-RS', 'lat': -30.0394, 'lon': -52.8939, 'vagas': 0},
        {'id': 28, 'nome': '3ª Cia E Cmb Mec', 'cidade': 'Dom Pedrito-RS', 'lat': -30.9833, 'lon': -54.6722, 'vagas': 0},
        {'id': 29, 'nome': '6º BE Cmb', 'cidade': 'São Gabriel-RS', 'lat': -30.3375, 'lon': -54.3203, 'vagas': 0},
        {'id': 38, 'nome': '8ª Cia E Cmb', 'cidade': 'São Leopoldo-RS', 'lat': -29.7626, 'lon': -51.1477, 'vagas': 1},
        # CMO
        {'id': 31, 'nome': '9º BEC', 'cidade': 'Cuiabá-MT', 'lat': -15.5989, 'lon': -56.0949, 'vagas': 0},
        {'id': 32, 'nome': '9º BE Cmb', 'cidade': 'Aquidauana-MS', 'lat': -20.4706, 'lon': -55.7875, 'vagas': 0},
        {'id': 33, 'nome': '4ª Cia E Cmb Mec', 'cidade': 'Jardim-MS', 'lat': -21.4803, 'lon': -56.1383, 'vagas': 0}
    ]
    
    total_vagas = 43
    for _ in range(total_vagas):
        unidade_escolhida = random.choice(unidades)
        unidade_escolhida['vagas'] += 1
        
    return unidades

initial_unidades = get_initial_unidades()

# --- Variáveis de Estado Globais ---
current_turn = 1
# --- Database setup ---
def init_db():
    db_file = 'database.db'
    # Apaga o DB antigo para garantir que os dados aleatórios sejam aplicados
    # if os.path.exists(db_file):
    #     os.remove(db_file)

    with sqlite3.connect(db_file) as conn:
        cursor = conn.cursor()
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                username TEXT NOT NULL UNIQUE,
                email TEXT NOT NULL UNIQUE,
                password TEXT NOT NULL,
                classification INTEGER
            )
        ''')
        
        cursor.execute("SELECT COUNT(*) FROM users")
        if cursor.fetchone()[0] == 0:
            student_names = [
                "GOUVEIA", "COSTA", "DOS ANJOS", "LEANDRO MENDES", "SIQUEIRA", "RONEY", "ZOANYS",
                "JULIANO", "VICENTE CARVALHO", "ROGER SILVA", "CARDOSO JUNIOR", "COBIANCHI",
                "EVERTON VIEIRA", "ANDREY ENDREO", "ERICO FARIA", "CAMARGO", "ALEXANDRE",
                "SAMIR LIMA", "GUEDES MAIA", "RODOLFO", "DE CASTRO", "PEDROSA", "DELGADO JUNIOR",
                "ROMERO", "WILDER", "ONÓRIO", "WESLLEN", "ALMEIDA", "ORNELAS", "GUTIERRE",
                "MEIRELES", "DECESARIS", "ABRAHÃO", "FONSECA LIMA", "VICTOR LOPES", "ALEXANDRE CRUZ",
                "GIARETTA", "JARDEL", "MIGUEL MARINO", "WILSON", "A. SILVÉRIO", "COSTA SANTOS", "CAIO WILLIAM"
            ]
            random.shuffle(student_names) # Embaralha a lista de nomes

            for i, name in enumerate(student_names):
                username = name
                email = f'{name.lower().replace(" ", ".")}@example.com'
                password = bcrypt.hashpw('password'.encode('utf-8'), bcrypt.gensalt())
                classification = i + 1
                cursor.execute(
                    'INSERT INTO users (username, email, password, classification) VALUES (?, ?, ?, ?)',
                    (username, email, password, classification)
                )
            
            # Add a read-only user
            username = 'consulta'
            email = 'consulta@example.com'
            password = bcrypt.hashpw('consulta'.encode('utf-8'), bcrypt.gensalt())
            classification = 99
            cursor.execute(
                'INSERT INTO users (username, email, password, classification) VALUES (?, ?, ?, ?)',
                (username, email, password, classification)
            )
            # Add a god user
            username = 'god'
            email = 'god@example.com'
            password = bcrypt.hashpw('godmode'.encode('utf-8'), bcrypt.gensalt())
            classification = 0
            cursor.execute(
                'INSERT INTO users (username, email, password, classification) VALUES (?, ?, ?, ?)',
                (username, email, password, classification)
            )

            # --- Adicionar usuários externos/eletivas ---
            external_users = [
                {"username": "GUEDES", "classification": 91},
                {"username": "CANDIA", "classification": 92},
                {"username": "PICO", "classification": 93},
                {"username": "LUGONES", "classification": 94}
            ]
            for user_data in external_users:
                username = user_data["username"]
                email = f'{username.lower().replace(" ", ".")}@example.com'
                password = bcrypt.hashpw('password'.encode('utf-8'), bcrypt.gensalt())
                classification = user_data["classification"]
                cursor.execute(
                    'INSERT OR IGNORE INTO users (username, email, password, classification) VALUES (?, ?, ?, ?)',
                    (username, email, password, classification)
                )
        
        # Tabelas de estado da aplicação
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS app_state (
                key TEXT PRIMARY KEY,
                value INTEGER
            )
        ''')
        cursor.execute('INSERT INTO app_state (key, value) VALUES (?, ?)', ('current_turn', 1))
        cursor.execute('INSERT INTO app_state (key, value) VALUES (?, ?)', ('ranking_token', 'changeme'))
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS escolhas (
                classification INTEGER PRIMARY KEY,
                unidade_nome TEXT,
                unidade_id INTEGER
            )
        ''')
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS unidades (
                id INTEGER PRIMARY KEY,
                nome TEXT,
                cidade TEXT,
                lat REAL,
                lon REAL,
                vagas INTEGER
            )
        ''')
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS user_priorities (
                user_id INTEGER,
                unidade_id INTEGER,
                priority_order INTEGER,
                PRIMARY KEY (user_id, unidade_id)
            )
        ''')
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS allocation_results (
                user_id INTEGER PRIMARY KEY,
                unidade_id INTEGER,
                FOREIGN KEY (user_id) REFERENCES users(id),
                FOREIGN KEY (unidade_id) REFERENCES unidades(id)
            )
        ''')
        
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS pre_login_ranking (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                score REAL NOT NULL
            )
        ''')

        # Popular a tabela de unidades
        cursor.execute("SELECT COUNT(*) FROM unidades")
        if cursor.fetchone()[0] == 0:
            global initial_unidades
            initial_unidades = get_initial_unidades() # Garante que as vagas aleatórias sejam usadas
            for u in initial_unidades:
                cursor.execute(
                    "INSERT INTO unidades (id, nome, cidade, lat, lon, vagas) VALUES (?, ?, ?, ?, ?, ?)",
                    (u['id'], u['nome'], u['cidade'], u['lat'], u['lon'], u['vagas'])
                )
        conn.commit()

# --- Carregar Estado do DB ---
def load_state_from_db():
    global current_turn
    with sqlite3.connect('database.db') as conn:
        conn.row_factory = sqlite3.Row
        cursor = conn.cursor()
        
        # Carregar turno atual
        cursor.execute("SELECT value FROM app_state WHERE key = 'current_turn'")
        turn_row = cursor.fetchone()
        current_turn = turn_row['value'] if turn_row else 1

# --- Routes ---
@app.route('/')
def index():
    return render_template('index.html')

@app.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    username_or_email = data['username_or_email']
    password = data['password']

    if username_or_email == 'admin' and password == '123123':
        session['admin_loggedin'] = True
        return jsonify({'success': True, 'redirect': url_for('admin_dashboard')})

    with sqlite3.connect('database.db') as conn:
        cursor = conn.cursor()
        cursor.execute('SELECT id, username, password, classification FROM users WHERE username = ? OR email = ?',
                       (username_or_email, username_or_email))
        user = cursor.fetchone()

    if user and bcrypt.checkpw(password.encode('utf-8'), user[2]):
        session['loggedin'] = True
        session['id'] = user[0]
        session['username'] = user[1]
        session['classification'] = user[3]
        return jsonify({'success': True, 'redirect': url_for('dashboard')})
    else:
        return jsonify({'success': False, 'message': 'Usuário, e-mail ou senha inválidos.'})

@app.route('/dashboard')
def dashboard():
    if 'loggedin' in session:
        return render_template('dashboard.html', username=session['username'])
    return redirect(url_for('index'))

@app.route('/logout')
def logout():
    session.clear()
    return redirect(url_for('index'))

@app.route('/api/status')
def api_status():
    if 'loggedin' in session or 'admin_loggedin' in session:
        with sqlite3.connect('database.db') as conn:
            conn.row_factory = sqlite3.Row
            cursor = conn.cursor()
            
            cursor.execute("SELECT username, classification FROM users WHERE username NOT IN ('god', 'consulta') ORDER BY classification")
            users = [dict(row) for row in cursor.fetchall()]

            cursor.execute("SELECT * FROM unidades")
            unidades = [dict(row) for row in cursor.fetchall()]

            cursor.execute("SELECT classification, unidade_nome FROM escolhas")
            escolhas_rows = cursor.fetchall()
            escolhas_feitas = {row['classification']: row['unidade_nome'] for row in escolhas_rows}

            cursor.execute("SELECT value FROM app_state WHERE key = 'current_turn'")
            turn_row = cursor.fetchone()
            current_turn = turn_row['value'] if turn_row else 1

        return jsonify({
            'current_turn': current_turn,
            'unidades': unidades,
            'user_classification': session.get('classification') if session.get('username') != 'god' else current_turn,
            'username': session.get('username'),
            'users': users,
            'escolhas_feitas': escolhas_feitas
        })
    return jsonify({'error': 'Unauthorized'}), 401

@app.route('/api/choose', methods=['POST'])
def api_choose():
    if 'loggedin' in session:
        data = request.get_json()
        unidade_id = data.get('unidade_id')
        user_classification = session.get('classification')
        is_god = session.get('username') == 'god'

        with sqlite3.connect('database.db') as conn:
            conn.row_factory = sqlite3.Row
            cursor = conn.cursor()
            cursor.execute("SELECT value FROM app_state WHERE key = 'current_turn'")
            current_turn = cursor.fetchone()['value']

            if not is_god and user_classification != current_turn:
                return jsonify({'success': False, 'message': 'Não é sua vez de escolher.'}), 400
            
            if session.get('username') == 'consulta':
                return jsonify({'success': False, 'message': 'Usuário de consulta não pode escolher.'}), 400

            cursor.execute("SELECT * FROM unidades WHERE id = ?", (unidade_id,))
            unidade = dict(cursor.fetchone())

            if not unidade:
                return jsonify({'success': False, 'message': 'Unidade não encontrada.'}), 404

            if unidade['vagas'] <= 0:
                return jsonify({'success': False, 'message': 'Não há vagas nesta unidade.'}), 400

            # Lógica de escolha
            cursor.execute("UPDATE unidades SET vagas = vagas - 1 WHERE id = ?", (unidade_id,))
            cursor.execute(
                "INSERT OR REPLACE INTO escolhas (classification, unidade_nome, unidade_id) VALUES (?, ?, ?)",
                (current_turn, unidade['nome'], unidade['id'])
            )
            cursor.execute(
                "UPDATE app_state SET value = value + 1 WHERE key = 'current_turn'"
            )
            conn.commit()

        return jsonify({'success': True, 'message': 'Escolha realizada com sucesso!'})
    return jsonify({'error': 'Unauthorized'}), 401

@app.route('/admin', endpoint='admin_dashboard')
def admin_dashboard():
    if 'admin_loggedin' in session:
        with sqlite3.connect('database.db') as conn:
            conn.row_factory = sqlite3.Row
            cursor = conn.cursor()
            cursor.execute("SELECT id, username, classification as rank FROM users WHERE classification < 90 ORDER BY classification")
            users = [dict(row) for row in cursor.fetchall()]
        return render_template('admin.html', username='Admin', users=users)
    return redirect(url_for('index'))

@app.route('/api/reset_choices', methods=['POST'])
def reset_choices():
    if 'admin_loggedin' in session:
        with sqlite3.connect('database.db') as conn:
            cursor = conn.cursor()
            cursor.execute("DELETE FROM escolhas")
            cursor.execute("UPDATE app_state SET value = 1 WHERE key = 'current_turn'")
            
            # Resetar vagas na tabela de unidades
            for u in initial_unidades:
                cursor.execute("UPDATE unidades SET vagas = ? WHERE id = ?", (u['vagas'], u['id']))
            conn.commit()

        return jsonify({'success': True, 'message': 'Registros de escolhas zerados com sucesso!'})
    return jsonify({'success': False, 'message': 'Unauthorized'}), 401

@app.route('/api/reset_pre_login_ranking', methods=['POST'])
def reset_pre_login_ranking():
    if 'admin_loggedin' in session:
        with sqlite3.connect('database.db') as conn:
            cursor = conn.cursor()
            cursor.execute("DELETE FROM pre_login_ranking")
            conn.commit()
        return jsonify({'success': True, 'message': 'O ranking de simulação foi zerado com sucesso!'})
    return jsonify({'success': False, 'message': 'Unauthorized'}), 401


@app.route('/api/update_username', methods=['POST'])
def update_username():
    if 'admin_loggedin' in session:
        data = request.get_json()
        old_username = data['old_username']
        new_username = data['new_username']
        with sqlite3.connect('database.db') as conn:
            cursor = conn.cursor()
            cursor.execute('UPDATE users SET username = ? WHERE username = ?', (new_username, old_username))
            conn.commit()
        return jsonify({'success': True})
    return jsonify({'success': False, 'message': 'Unauthorized'}), 401

@app.route('/api/update_vagas', methods=['POST'])
def update_vagas():
    if 'admin_loggedin' in session:
        data = request.get_json()
        unidade_id = data.get('unidade_id')
        new_vagas = data.get('vagas')

        try:
            new_vagas = int(new_vagas)
        except (ValueError, TypeError):
            return jsonify({'success': False, 'message': 'Número de vagas inválido.'}), 400

        with sqlite3.connect('database.db') as conn:
            cursor = conn.cursor()
            cursor.execute("UPDATE unidades SET vagas = ? WHERE id = ?", (new_vagas, unidade_id))
            conn.commit()

        return jsonify({'success': True, 'message': 'Vagas atualizadas com sucesso!'})
    return jsonify({'success': False, 'message': 'Unauthorized'}), 401

# --- Novas Rotas para Priorização ---

@app.route('/priorities')
def priorities():
    if 'loggedin' in session or 'admin_loggedin' in session:
        username = session.get('username', 'Admin')
        return render_template('priorities.html', username=username)
    return redirect(url_for('index'))

@app.route('/api/save_priorities', methods=['POST'])
def save_priorities():
    if 'loggedin' in session:
        data = request.get_json()
        priority_ids = data.get('priorities', [])
        user_id = session.get('id')

        with sqlite3.connect('database.db') as conn:
            cursor = conn.cursor()
            # Limpa as prioridades antigas do usuário
            cursor.execute("DELETE FROM user_priorities WHERE user_id = ?", (user_id,))
            
            # Insere as novas prioridades
            for i, unidade_id in enumerate(priority_ids):
                cursor.execute(
                    "INSERT INTO user_priorities (user_id, unidade_id, priority_order) VALUES (?, ?, ?)",
                    (user_id, unidade_id, i + 1)
                )
            conn.commit()

        return jsonify({'success': True, 'message': 'Prioridades salvas com sucesso!'})
    return jsonify({'error': 'Unauthorized'}), 401

@app.route('/api/get_priorities', methods=['GET'])
def get_priorities():
    if 'admin_loggedin' in session:
        return jsonify({'priorities': []}) # Admin não tem prioridades, retorna lista vazia

    if 'loggedin' in session:
        user_id = session.get('id')
        with sqlite3.connect('database.db') as conn:
            cursor = conn.cursor()
            cursor.execute(
                "SELECT unidade_id FROM user_priorities WHERE user_id = ? ORDER BY priority_order",
                (user_id,)
            )
            priorities = [row[0] for row in cursor.fetchall()]
        return jsonify({'priorities': priorities})
    
    return jsonify({'error': 'Unauthorized'}), 401

@app.route('/api/run_allocation', methods=['POST'])
def run_allocation():
    if 'admin_loggedin' in session:
        with sqlite3.connect('database.db') as conn:
            conn.row_factory = sqlite3.Row
            cursor = conn.cursor()

            # 1. Buscar todos os dados necessários
            cursor.execute("SELECT * FROM users WHERE classification < 90 ORDER BY classification")
            users = cursor.fetchall()

            cursor.execute("SELECT * FROM user_priorities")
            all_priorities = cursor.fetchall()

            cursor.execute("SELECT * FROM unidades")
            unidades_list = cursor.fetchall()
            # Usar um dicionário para facilitar a atualização das vagas
            unidades_vagas = {u['id']: u['vagas'] for u in unidades_list}

            # Estrutura para guardar as prioridades de cada usuário
            user_choices = {user['id']: [] for user in users}
            for p in all_priorities:
                if p['user_id'] in user_choices:
                    user_choices[p['user_id']].append({'unidade_id': p['unidade_id'], 'priority': p['priority_order']})
            
            # Ordenar as escolhas de cada usuário por prioridade
            for user_id in user_choices:
                user_choices[user_id].sort(key=lambda x: x['priority'])

            # 2. Limpar resultados antigos e preparar para a nova alocação
            cursor.execute("DELETE FROM allocation_results")
            allocation = {}

            # 3. Processar a alocação
            for user in users:
                user_id = user['id']
                for choice in user_choices.get(user_id, []):
                    unidade_id = choice['unidade_id']
                    if unidades_vagas.get(unidade_id, 0) > 0:
                        allocation[user_id] = unidade_id
                        unidades_vagas[unidade_id] -= 1
                        break # Vai para o próximo usuário
            
            # 4. Salvar os resultados no banco de dados
            for user_id, unidade_id in allocation.items():
                cursor.execute(
                    "INSERT INTO allocation_results (user_id, unidade_id) VALUES (?, ?)",
                    (user_id, unidade_id)
                )
            
            conn.commit()

        return jsonify({'success': True, 'message': 'Alocação executada e resultados salvos com sucesso!'})
    return jsonify({'error': 'Unauthorized'}), 401

@app.route('/api/allocation_results', methods=['GET'])
def allocation_results():
    if 'loggedin' in session or 'admin_loggedin' in session:
        with sqlite3.connect('database.db') as conn:
            conn.row_factory = sqlite3.Row
            cursor = conn.cursor()
            cursor.execute("""
                SELECT u.username, un.nome as unidade_nome, un.cidade
                FROM allocation_results ar
                JOIN users u ON ar.user_id = u.id
                JOIN unidades un ON ar.unidade_id = un.id
                ORDER BY u.classification
            """)
            results = [dict(row) for row in cursor.fetchall()]
        return jsonify({'results': results})
    return jsonify({'error': 'Unauthorized'}), 401

@app.route('/api/missing_priorities', methods=['GET'])
def missing_priorities():
    if 'admin_loggedin' in session:
        with sqlite3.connect('database.db') as conn:
            cursor = conn.cursor()
            cursor.execute("""
                SELECT u.username
                FROM users u
                LEFT JOIN user_priorities up ON u.id = up.user_id
                WHERE u.classification < 90 AND u.username != 'god' AND up.user_id IS NULL
                ORDER BY u.classification
            """)
            missing_users = [row[0] for row in cursor.fetchall()]
        return jsonify({'missing_users': missing_users})
    return jsonify({'error': 'Unauthorized'}), 401

@app.route('/api/ranking_token', methods=['GET', 'POST'])
def ranking_token():
    if 'admin_loggedin' not in session:
        return jsonify({'success': False, 'message': 'Unauthorized'}), 401

    with sqlite3.connect('database.db') as conn:
        cursor = conn.cursor()
        if request.method == 'POST':
            data = request.get_json()
            new_token = data.get('token')
            cursor.execute("INSERT OR REPLACE INTO app_state (key, value) VALUES (?, ?)", ('ranking_token', new_token))
            conn.commit()
            return jsonify({'success': True})
        else: # GET request
            cursor.execute("SELECT value FROM app_state WHERE key = 'ranking_token'")
            token_row = cursor.fetchone()
            token = token_row[0] if token_row else ''
            return jsonify({'token': token})


@app.route('/pre_login_ranking', methods=['GET', 'POST'])
def handle_pre_login_ranking():
    with sqlite3.connect('database.db') as conn:
        cursor = conn.cursor()
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS pre_login_ranking (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                score REAL NOT NULL
            )
        ''')
        conn.commit()

    if request.method == 'POST':
        data = request.get_json()
        name = data.get('name')
        score_str = data.get('score')
        token = data.get('token')

        with sqlite3.connect('database.db') as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT value FROM app_state WHERE key = 'ranking_token'")
            token_row = cursor.fetchone()
            correct_token = token_row[0] if token_row else ''
        
        if token != correct_token:
            return jsonify({'success': False, 'message': 'Token inválido.'}), 403

        if not name or not score_str:
            return jsonify({'success': False, 'message': 'Nome e nota são obrigatórios.'}), 400

        name = name.upper()

        try:
            score_str = str(score_str).replace(',', '.')
            score = float(score_str)
        except (ValueError, TypeError):
            return jsonify({'success': False, 'message': 'Formato de nota inválido. Use apenas números e separador decimal (ponto ou vírgula).'}), 400

        with sqlite3.connect('database.db') as conn:
            cursor = conn.cursor()
            cursor.execute("INSERT INTO pre_login_ranking (name, score) VALUES (?, ?)", (name, score))
            conn.commit()

        with sqlite3.connect('database.db') as conn:
            conn.row_factory = sqlite3.Row
            cursor = conn.cursor()
            cursor.execute("SELECT name, score FROM pre_login_ranking ORDER BY score DESC")
            ranking = [dict(row) for row in cursor.fetchall()]

        return jsonify({'success': True, 'ranking': ranking})

    elif request.method == 'GET':
        with sqlite3.connect('database.db') as conn:
            conn.row_factory = sqlite3.Row
            cursor = conn.cursor()
            cursor.execute("SELECT name, score FROM pre_login_ranking ORDER BY score DESC")
            ranking = [dict(row) for row in cursor.fetchall()]
        return jsonify({'ranking': ranking})


# --- Novas Rotas para o Painel de Admin ---

@app.route('/api/users_ranking', methods=['GET'])
def get_users_ranking():
    if 'admin_loggedin' in session:
        with sqlite3.connect('database.db') as conn:
            conn.row_factory = sqlite3.Row
            cursor = conn.cursor()
            cursor.execute("SELECT id, username, classification as rank FROM users WHERE classification < 90 ORDER BY classification")
            users = [dict(row) for row in cursor.fetchall()]
        return jsonify(users)
    return jsonify({'error': 'Unauthorized'}), 401

@app.route('/api/update_ranking', methods=['POST'])
def update_ranking():
    if 'admin_loggedin' in session:
        data = request.get_json()
        with sqlite3.connect('database.db') as conn:
            cursor = conn.cursor()
            for user_data in data:
                cursor.execute("UPDATE users SET classification = ?, username = ? WHERE id = ?", 
                               (user_data['rank'], user_data['name'], user_data['id']))
            conn.commit()
        return jsonify({'success': True})
    return jsonify({'error': 'Unauthorized'}), 401

@app.route('/api/units', methods=['GET'])
def get_units():
    with sqlite3.connect('database.db') as conn:
        conn.row_factory = sqlite3.Row
        cursor = conn.cursor()
        cursor.execute("SELECT id, nome as name, lat, lon, vagas as vacancies FROM unidades")
        units = [dict(row) for row in cursor.fetchall()]
    return jsonify(units)

@app.route('/api/units/<int:unit_id>/vacancies', methods=['POST'])
def update_unit_vacancies(unit_id):
    if 'admin_loggedin' in session:
        data = request.get_json()
        new_vacancies = data.get('vacancies')
        with sqlite3.connect('database.db') as conn:
            cursor = conn.cursor()
            cursor.execute("UPDATE unidades SET vagas = ? WHERE id = ?", (new_vacancies, unit_id))
            conn.commit()
            
            conn.row_factory = sqlite3.Row
            cursor.execute("SELECT id, nome as name, lat, lon, vagas as vacancies FROM unidades WHERE id = ?", (unit_id,))
            updated_unit = dict(cursor.fetchone())

        return jsonify({'success': True, 'unit': updated_unit})
    return jsonify({'error': 'Unauthorized'}), 401

# --- Rota para Relatório de Escolhas de OMs ---
@app.route('/api/escolhas/report/csv')
def download_escolhas_report():
    if 'admin_loggedin' not in session:
        return jsonify({'error': 'Unauthorized'}), 401
    
    with sqlite3.connect('database.db') as conn:
        conn.row_factory = sqlite3.Row
        cursor = conn.cursor()
        cursor.execute("""
            SELECT 
                e.classification as ordem,
                u.username as nome_militar,
                e.unidade_nome as om_escolhida
            FROM escolhas e
            JOIN users u ON e.classification = u.classification
            ORDER BY e.classification
        """)
        data = [dict(row) for row in cursor.fetchall()]
    
    if not data:
        return jsonify({'message': 'Nenhuma escolha foi registrada ainda.'}), 404
    
    df = pd.DataFrame(data)
    
    # Renomear colunas para o relatório
    df.rename(columns={
        'ordem': 'Ordem',
        'nome_militar': 'Nome do Militar', 
        'om_escolhida': 'OM Escolhida'
    }, inplace=True)
    
    # Criar um buffer de bytes para o CSV
    output = io.BytesIO()
    df.to_csv(output, index=False, encoding='utf-8-sig', sep=';')
    csv_output = output.getvalue()
    
    response = make_response(csv_output)
    response.headers.set('Content-Disposition', 'attachment', filename='relatorio_escolhas_om.csv')
    response.headers.set('Content-Type', 'text/csv; charset=utf-8')
    return response

# --- Rotas para Gerenciamento de Eletivas (Admin) ---

@app.route('/api/eletivas/report/csv')
def download_eletivas_report():
    if 'admin_loggedin' not in session:
        return jsonify({'error': 'Unauthorized'}), 401

    with sqlite3.connect('database.db') as conn:
        conn.row_factory = sqlite3.Row
        cursor = conn.cursor()
        cursor.execute("""
            SELECT 
                ec.ordem,
                ec.nome_aluno,
                e.nome_materia
            FROM eletivas_escolhas ee
            JOIN eletivas_classificacao ec ON ee.id_aluno_classificacao = ec.id
            JOIN eletivas e ON ee.id_eletiva = e.id
            ORDER BY ec.ordem
        """)
        data = [dict(row) for row in cursor.fetchall()]

    if not data:
        return jsonify({'message': 'Nenhum dado para exportar.'}), 404

    df = pd.DataFrame(data)
    
    # Renomear colunas para o relatório
    df.rename(columns={
        'ordem': 'Ordem',
        'nome_aluno': 'Nome do Aluno',
        'nome_materia': 'Matéria Escolhida'
    }, inplace=True)

    # Criar um buffer de bytes para o CSV
    output = io.BytesIO()
    df.to_csv(output, index=False, encoding='utf-8-sig', sep=';')
    csv_output = output.getvalue()

    response = make_response(csv_output)
    response.headers.set('Content-Disposition', 'attachment', filename='relatorio_eletivas.csv')
    response.headers.set('Content-Type', 'text/csv; charset=utf-8')
    return response


@app.route('/admin/eletivas')
def admin_eletivas():
    if 'admin_loggedin' in session:
        return render_template('admin_eletivas.html', username='Admin')
    return redirect(url_for('index'))

@app.route('/api/eletivas', methods=['GET'])
def get_eletivas():
    if 'admin_loggedin' not in session:
        return jsonify({'error': 'Unauthorized'}), 401
    
    with sqlite3.connect('database.db') as conn:
        conn.row_factory = sqlite3.Row
        cursor = conn.cursor()
        cursor.execute("SELECT id, nome_materia, vagas FROM eletivas ORDER BY nome_materia")
        eletivas = [dict(row) for row in cursor.fetchall()]
    return jsonify(eletivas)

@app.route('/api/eletivas/add', methods=['POST'])
def add_eletiva():
    if 'admin_loggedin' not in session:
        return jsonify({'success': False, 'message': 'Unauthorized'}), 401
    
    data = request.get_json()
    nome_materia = data.get('nome_materia')
    vagas = data.get('vagas')

    if not nome_materia or vagas is None:
        return jsonify({'success': False, 'message': 'Nome da matéria e vagas são obrigatórios.'}), 400

    try:
        with sqlite3.connect('database.db') as conn:
            cursor = conn.cursor()
            cursor.execute("INSERT INTO eletivas (nome_materia, vagas, vagas_iniciais) VALUES (?, ?, ?)", (nome_materia, vagas, vagas))
            conn.commit()
        return jsonify({'success': True})
    except sqlite3.IntegrityError:
        return jsonify({'success': False, 'message': 'Uma matéria com este nome já existe.'}), 409
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500

@app.route('/api/eletivas/edit/<int:id>', methods=['POST'])
def edit_eletiva(id):
    if 'admin_loggedin' not in session:
        return jsonify({'success': False, 'message': 'Unauthorized'}), 401
        
    data = request.get_json()
    nome_materia = data.get('nome_materia')
    vagas = data.get('vagas')

    if not nome_materia or vagas is None:
        return jsonify({'success': False, 'message': 'Nome da matéria e vagas são obrigatórios.'}), 400

    try:
        with sqlite3.connect('database.db') as conn:
            cursor = conn.cursor()
            cursor.execute("UPDATE eletivas SET nome_materia = ?, vagas = ?, vagas_iniciais = ? WHERE id = ?", (nome_materia, vagas, vagas, id))
            conn.commit()
        return jsonify({'success': True})
    except sqlite3.IntegrityError:
        return jsonify({'success': False, 'message': 'O nome da matéria já está em uso por outra.'}), 409
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500

@app.route('/api/eletivas/delete/<int:id>', methods=['POST'])
def delete_eletiva(id):
    if 'admin_loggedin' not in session:
        return jsonify({'success': False, 'message': 'Unauthorized'}), 401

    try:
        with sqlite3.connect('database.db') as conn:
            cursor = conn.cursor()
            # Opcional: verificar se a eletiva tem escolhas associadas antes de deletar
            cursor.execute("DELETE FROM eletivas WHERE id = ?", (id,))
            conn.commit()
        return jsonify({'success': True})
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500

def get_initial_eletivas():
    """Retorna a lista inicial de matérias eletivas com suas vagas. Vazio por padrão."""
    return []

@app.route('/api/eletivas/reset', methods=['POST'])
def reset_eletivas_choices():
    if 'admin_loggedin' not in session:
        return jsonify({'success': False, 'message': 'Unauthorized'}), 401
    
    try:
        with sqlite3.connect('database.db') as conn:
            cursor = conn.cursor()
            # Limpa a tabela de escolhas feitas
            cursor.execute("DELETE FROM eletivas_escolhas")
            # Reseta o status de 'ja_escolheu' para todos na classificação
            cursor.execute("UPDATE eletivas_classificacao SET ja_escolheu = 0")
            # Restaura o número de vagas de cada matéria para o seu valor inicial
            cursor.execute("UPDATE eletivas SET vagas = vagas_iniciais")
            conn.commit()
        return jsonify({'success': True, 'message': 'Todas as escolhas de eletivas foram zeradas e as vagas restauradas com sucesso.'})
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500

# --- Rotas para Escolha de Eletivas (Aluno) ---

@app.route('/eletivas', endpoint='eletivas_page')
def eletivas_page():
    if 'loggedin' in session:
        # O nome de usuário na sessão principal é usado para a página
        return render_template('escolher_eletivas.html', username=session['username'])
    return redirect(url_for('index'))

@app.route('/api/eletivas/status', methods=['GET'])
def get_eletivas_status():
    if 'loggedin' not in session:
        return jsonify({'error': 'Unauthorized'}), 401

    with sqlite3.connect('database.db') as conn:
        conn.row_factory = sqlite3.Row
        cursor = conn.cursor()

        # 1. Pega o usuário logado na sessão principal
        username_session = session.get('username')

        # 2. Encontra o registro correspondente na tabela de classificação de eletivas
        cursor.execute("SELECT * FROM eletivas_classificacao WHERE nome_aluno = ?", (username_session,))
        user_row = cursor.fetchone()
        current_user = dict(user_row) if user_row else None

        # 3. Pega toda a lista de classificação
        cursor.execute("SELECT * FROM eletivas_classificacao ORDER BY ordem")
        classification = [dict(row) for row in cursor.fetchall()]

        # 4. Pega todas as eletivas disponíveis
        cursor.execute("SELECT id, nome_materia, vagas FROM eletivas ORDER BY nome_materia")
        eletivas = [dict(row) for row in cursor.fetchall()]

        # 5. Determina de quem é a vez
        cursor.execute("SELECT * FROM eletivas_classificacao WHERE ja_escolheu = 0 ORDER BY ordem LIMIT 1")
        turn_row = cursor.fetchone()
        current_turn_info = dict(turn_row) if turn_row else None

    return jsonify({
        'current_user': current_user,
        'classification': classification,
        'eletivas': eletivas,
        'current_turn_info': current_turn_info
    })

@app.route('/api/eletivas/choose', methods=['POST'])
def choose_eletiva():
    if 'loggedin' not in session:
        return jsonify({'success': False, 'message': 'Unauthorized'}), 401

    data = request.get_json()
    eletiva_id = data.get('eletiva_id')
    username_session = session.get('username')

    with sqlite3.connect('database.db') as conn:
        conn.row_factory = sqlite3.Row
        cursor = conn.cursor()

        # --- Início da Transação ---
        try:
            # 1. Verifica de quem é a vez
            cursor.execute("SELECT * FROM eletivas_classificacao WHERE ja_escolheu = 0 ORDER BY ordem LIMIT 1")
            turn_row = cursor.fetchone()
            if not turn_row:
                return jsonify({'success': False, 'message': 'A escolha de eletivas já foi finalizada.'}), 400
            
            current_turn_user = dict(turn_row)
            if current_turn_user['nome_aluno'] != username_session:
                return jsonify({'success': False, 'message': 'Não é sua vez de escolher.'}), 403

            # 2. Verifica se o usuário já não escolheu
            if current_turn_user['ja_escolheu']:
                 return jsonify({'success': False, 'message': 'Você já realizou sua escolha.'}), 400

            # 3. Verifica se a eletiva existe e tem vagas
            cursor.execute("SELECT * FROM eletivas WHERE id = ?", (eletiva_id,))
            eletiva_row = cursor.fetchone()
            if not eletiva_row:
                return jsonify({'success': False, 'message': 'Matéria eletiva não encontrada.'}), 404
            
            eletiva = dict(eletiva_row)
            if eletiva['vagas'] <= 0:
                return jsonify({'success': False, 'message': 'Não há mais vagas para esta matéria.'}), 400

            # 4. Atualiza o banco de dados
            # Decrementa vaga
            cursor.execute("UPDATE eletivas SET vagas = vagas - 1 WHERE id = ?", (eletiva_id,))
            # Marca que o usuário já escolheu
            cursor.execute("UPDATE eletivas_classificacao SET ja_escolheu = 1 WHERE id = ?", (current_turn_user['id'],))
            # Registra a escolha
            cursor.execute("INSERT INTO eletivas_escolhas (id_aluno_classificacao, id_eletiva) VALUES (?, ?)",
                           (current_turn_user['id'], eletiva_id))
            
            conn.commit()
            # --- Fim da Transação ---

        except sqlite3.Error as e:
            conn.rollback() # Desfaz as alterações em caso de erro
            return jsonify({'success': False, 'message': f'Erro no banco de dados: {e}'}), 500
        except Exception as e:
            conn.rollback()
            return jsonify({'success': False, 'message': f'Ocorreu um erro inesperado: {e}'}), 500

    return jsonify({'success': True, 'message': 'Escolha registrada com sucesso!'})

def init_eletivas_db():
    with sqlite3.connect('database.db') as conn:
        cursor = conn.cursor()

        # --- Tabelas para Eletivas ---
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS eletivas (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                nome_materia TEXT NOT NULL UNIQUE,
                vagas INTEGER NOT NULL,
                vagas_iniciais INTEGER NOT NULL
            )
        ''')

        cursor.execute('''
            CREATE TABLE IF NOT EXISTS eletivas_classificacao (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                nome_aluno TEXT NOT NULL UNIQUE,
                ordem INTEGER NOT NULL UNIQUE,
                ja_escolheu BOOLEAN NOT NULL DEFAULT 0
            )
        ''')

        cursor.execute('''
            CREATE TABLE IF NOT EXISTS eletivas_escolhas (
                id_aluno_classificacao INTEGER,
                id_eletiva INTEGER,
                FOREIGN KEY (id_aluno_classificacao) REFERENCES eletivas_classificacao(id),
                FOREIGN KEY (id_eletiva) REFERENCES eletivas(id),
                PRIMARY KEY (id_aluno_classificacao, id_eletiva)
            )
        ''')

        # --- Popular as tabelas de eletivas ---
        cursor.execute("SELECT COUNT(*) FROM eletivas")
        if cursor.fetchone()[0] == 0:
            initial_eletivas = get_initial_eletivas()
            for eletiva in initial_eletivas:
                cursor.execute("INSERT INTO eletivas (nome_materia, vagas) VALUES (?, ?)",
                               (eletiva['nome_materia'], eletiva['vagas']))

        # --- Popular a tabela de classificação de eletivas ---
        cursor.execute("SELECT COUNT(*) FROM eletivas_classificacao")
        if cursor.fetchone()[0] == 0:
            classificacao_eletivas = [
                "GOUVEIA", "COSTA", "DOS ANJOS", "LEANDRO MENDES", "SIQUEIRA", "RONEY",
                "EVERTON VIEIRA", "ANDREY ENDREO", "ÉRICO FARIA", "CAMARGO", "ALEXANDRE",
                "SAMIR LIMA", "WILDER", "ONÓRIO", "WESLLEN", "ALMEIDA", "ORNELAS",
                "GUTIERRE", "GIARETTA", "JARDEL", "MIGUEL MARINO", "WILSON", "A. SILVÉRIO",
                "COSTA SANTOS", "ZOANYS", "JULIANO", "VICENTE CARVALHO", "ROGER SILVA",
                "CARDOSO JUNIOR", "COBIANCHI", "GUEDES MAIA", "RODOLFO", "DE CASTRO",
                "PEDROSA", "DELGADO JUNIOR", "ROMERO", "MEIRELES", "DECESARIS", "ABRAHÃO",
                "FONSECA LIMA", "VICTOR LOPES", "ALEXANDRE CRUZ", "CAIO WILLIAM", "GUEDES",
                "CANDIA", "PICO", "LUGONES"
            ]
            for i, nome in enumerate(classificacao_eletivas):
                cursor.execute(
                    "INSERT INTO eletivas_classificacao (nome_aluno, ordem) VALUES (?, ?)",
                    (nome, i + 1)
                )
        
        conn.commit()

if __name__ == '__main__':
    db_file = 'database.db'
    if not os.path.exists(db_file):
        init_db()
    init_eletivas_db() # Adiciona e popula as tabelas de eletivas
    load_state_from_db()
    app.run(debug=True)
