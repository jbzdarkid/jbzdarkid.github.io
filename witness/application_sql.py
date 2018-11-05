from application import application
from os import environ
from flask_sqlalchemy import SQLAlchemy

application.config['SQLALCHEMY_DATABASE_URI'] = 'mysql://{user}:{pass}@{host}:{port}/{name}'.format(
  user = environ['RDS_USERNAME'],
  pass = environ['RDS_PASSWORD'],
  host = environ['RDS_HOSTNAME'],
  port = environ['RDS_PORT'],
  name = environ['RDS_DB_NAME'],
)
db = SQLAlchemy(application)

class Puzzle(db.Model):
  __tablename__ = 'puzzles'

  id = db.Column(db.Integer, primary_key=True)
  data = db.Column(db.Text, nullable=False)
  user_id = db.Column(Integer, db.ForeignKey('users.id')) # , nullable=False

class User(db.Model):
  __tablename__ = 'users'

  id = db.Column(db.Integer, primary_key=True)
  disp_name = db.Column(db.String(80), nullable=False)
  # google_id
  # faceb_id
  # apple_id
  # msft_id

db.create_all()

new_puzzle = Puzzle(data='{"foo":"bar"}')
db.session.add(new_puzzle)
db.session.commit()