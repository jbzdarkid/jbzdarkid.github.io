# https://www.youtube.com/watch?v=K_RTlbOOCts
from application_base import application
from datetime import datetime
from flask import redirect, render_template
from flask_sqlalchemy import SQLAlchemy, event
from flask_wtf import FlaskForm
from os import environ
from wtforms import StringField
from hashlib import sha256

if 'RDS_DB_NAME' in environ:
  application.config['SQLALCHEMY_DATABASE_URI'] = 'mysql://{user}:{pswd}@{host}:{port}/{name}'.format(
    user = environ['RDS_USERNAME'],
    pswd = environ['RDS_PASSWORD'],
    host = environ['RDS_HOSTNAME'],
    port = environ['RDS_PORT'],
    name = environ['RDS_DB_NAME'],
  )
# Secret key will be empty for local development (which is OK, there's no CSRF risk locally.)
application.config['SECRET_KEY'] = environ['SECRET_KEY'] if 'SECRET_KEY' in environ else 'default'
db = SQLAlchemy(application)

class Puzzle(db.Model):
  __tablename__ = 'puzzles'

  id = db.Column(db.Integer, primary_key=True, autoincrement=True)
  # Language of 32: [0-9A-Z] / I, 1, O, 0,
  # 8 characters at 32 = 2^40
  # 50% of collision at 2^20 entries
  display_hash = db.Column(db.String(8), unique=True)
  data = db.Column(db.Text, nullable=False)
  date = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
  user_id = db.Column(db.Integer, db.ForeignKey('users.id')) #, nullable=False

def add_display_hash(new_puzzle):
  h = sha256()
  h.update(new_puzzle.data.encode())
  display_hash = h.hexdigest()[:8].upper()
  display_hash = display_hash.replace('I', 'A')
  display_hash = display_hash.replace('O', 'B')
  display_hash = display_hash.replace('1', 'C')
  display_hash = display_hash.replace('0', 'D')
  new_puzzle.display_hash = display_hash

class User(db.Model):
  __tablename__ = 'users'

  id = db.Column(db.Integer, primary_key=True)
  disp_name = db.Column(db.String(80), nullable=False)
  # google_id
  # faceb_id
  # apple_id
  # msft_id

db.create_all()

class MyForm(FlaskForm):
  publishData = StringField('publishData')

def publish():
  form = MyForm()
  new_puzzle = Puzzle(data=form.publishData.data)
  add_display_hash(new_puzzle)
  db.session.add(new_puzzle)
  db.session.commit()

  return redirect(f'/play/{new_puzzle.display_hash}')
application.add_url_rule('/publish', 'publish', publish, methods=['POST'])

def play(display_hash):
  puzzle = db.session.query(Puzzle).filter(Puzzle.display_hash == display_hash).first()
  if not puzzle or not puzzle.data:
    return render_template('404.html', display_hash=display_hash)
  return render_template('play.html', test='foo', puzzle=puzzle.data)
application.add_url_rule('/play/<display_hash>', 'play', play)

if __name__ == "__main__":
  application.run()
