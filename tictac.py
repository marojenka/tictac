import uuid
from flask import Flask, session, request, render_template, jsonify
from data import Gameboard
app = Flask(__name__)

g = Gameboard()
users = {}

def get_user():
    if 'user_uuid' in session:
        pass
    else:
        count = 0
        while True:
            uid = uuid.uuid1()
            if not uid in users:
                break
            count = count + 1
            if count > 1e4:
                break
        session['user_uuid'] = uid
        session['username'] = users[uid]
    if session['user_uuid'] not in users:
        uid = session['user_uuid']
        users[uid] = '%5s' % str(uid)[:5]
    return session['user_uuid']

@app.route('/')
def index():
    user = get_user()
    return render_template('index.html', user=user)

@app.route('/_ping')
def ping():
    return jsonify(answer='pong')

@app.route('/_clear')
def clear():
    g.clear()
    return jsonify(result="cleared")

@app.route('/_update')
def update():
    user = get_user()
    if user is None:
        return None
    if g.moves is None:
        return None
    move_number = request.args.get('move_number', type=int)
    players = [users.get(key) for key in g.players]
    return jsonify(moves=g.moves[move_number:], move_number=len(g.moves),
                   players=players)

@app.route('/_set_user')
def set_user():
    user = get_user()
    if user is None:
        return None
    value = request.args.get('value', type=int)
    if value not in (0, 1):
        return None
    g.users[value] = user
    return jsonify(value=value)

@app.route('/_set_username')
def set_username():
    user = get_user()
    username = request.args.get('username', type=str)
    users[user] = username
    session['username'] = username
    return jsonify(username=session['username'])

@app.route('/_move')
def move():
    user = get_user()
    try:
        x = request.args.get('x', 0, type=int)
        y = request.args.get('y', 0, type=int)
        result = g.move(x, y, user)
        return jsonify(count=result['count'], x=x, y=y,
                       value=result['value'])
    except:
        return jsonify(count=0)

app.secret_key='notthatseecreteh?'
