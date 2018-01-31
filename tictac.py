from flask import Flask, request, render_template, jsonify
from data import Gameboard
app = Flask(__name__)

g = Gameboard(30, 30)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/_ping')
def ping():
    return jsonify(answer='pong')

@app.route('/_refresh')
def refresh():
    return jsonify(data=g.squish())

@app.route('/_move')
def move():
    x = request.args.get('x', 0, type=int)
    y = request.args.get('y', 0, type=int)
    return jsonify(count=g.set(x, y))

