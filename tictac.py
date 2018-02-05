from flask import Flask, session, request, render_template, jsonify
from data import Gameboard
app = Flask(__name__)

g = Gameboard(30, 30)

last_uid = 1

def get_user():
    global last_uid
    if 'username' in session:
        pass
    else:
        session['username'] = last_uid
        last_uid = last_uid + 1
    return session['username']


@app.route('/')
def index():
    user = get_user()
    return render_template('index.html', user=user)

@app.route('/_ping')
def ping():
    return jsonify(answer='pong')

@app.route('/_refresh')
def refresh():
    return jsonify(data=g.squish())

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
    return jsonify(moves=g.moves[move_number:], move_number=len(g.moves))

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
