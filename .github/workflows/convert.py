import json
import os
import sys
import urllib.request
from pathlib import Path
from datetime import datetime

from validate import gpg_encrypt

# Obviously flask is overkill here, but this way I don't have to fight SQLAlchemy any more.
from flask import Flask
from flask_sqlalchemy import SQLAlchemy
application = Flask(__name__)
application.debug = False
application.config['SQLALCHEMY_DATABASE_URI'] = os.environ['SQLALCHEMY_DATABASE_URI'] # mysql://user:pswd@host:port/database'
application.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(application)

class Puzzle(db.Model):
    display_hash = db.Column(db.String(8), unique=True, primary_key=True)
    date = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    puzzle_json = db.Column(db.Text, nullable=False)
    solution_json = db.Column(db.Text, nullable=False)
    url = db.Column(db.Text)
    title = db.Column(db.Text)

def get_puzzles(offset=0, limit=100):
    return db.session.query(Puzzle).order_by(Puzzle.date.asc()).offset(offset).limit(limit)

if __name__ == '__main__':
    with app.app_context():
        offset = 0 if len(sys.argv) < 1 else int(sys.argv[1])
        limit = 100 if len(sys.argv) < 2 else int(sys.argv[2])
        puzzles = get_puzzles(offset, limit)
        puzzle_list = open('puzzle_list.js', 'r', encoding='utf-8').read().split('\n')

        for data in puzzles:
            # Extract data from the data (in case we fail, not that we should)
            title = data['title']
            puzzle_json = data['puzzle_json']
            solution_path = json.dumps(json.loads(data['solution_json'])['path'])

            # Encrypt this since we'll be saving it directly on the page
            solution_path = gpg_encrypt(solution_path, os.environ['SECRET'])

            display_hash = data['display_hash']
            image_url = f'images/{display_hash}.png'
            page_url = f'play/{display_hash}.html'

            print('Downloading image...')
            urllib.request.urlretrieve(data['url'], image_url)

            print('Creating puzzle page...')
            contents = open('.github/workflows/template_play.html', 'r', encoding='utf-8').read()
            contents = contents \
                .replace('%title%', title) \
                .replace('%display_hash%', display_hash) \
                .replace('%image_url%', image_url) \
                .replace('%puzzle%', puzzle_json) \
                .replace('%solution%', solution_path)
            with open(page_url, 'x', encoding='utf-8') as f:
                f.write(contents)

            puzzle_list.insert(1, f'"{display_hash}{title}",')

        with open('puzzle_list.js', 'w', encoding='utf-8') as f:
            f.write('\n'.join(puzzle_list))


