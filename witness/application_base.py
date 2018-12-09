from flask import send_from_directory
from flask_wtf import FlaskForm
from flask import redirect, render_template
import os
from wtforms import StringField
from application import application, db

# Root should be some sort of puzzle browser, not old index.html
# application.add_url_rule('/', 'root', lambda:send_from_directory('', 'index.html'))


def __static_content_func(filename):
  root, file = filename.rsplit('/', 1)
  return lambda:send_from_directory(root, file)

# Recursively host folders, files, with custom paths per request.
def host_statically(path, serverpath=None):
  path = path.replace('\\', '/')
  if os.path.isdir(path):
    for file in os.listdir(path):
      if serverpath:
        host_statically(f'{path}/{file}', f'{serverpath}/{file}')
      else:
        host_statically(f'{path}/{file}')
    return

  if not serverpath:
    serverpath = f'/{path}'
  application.add_url_rule(serverpath, path, __static_content_func(path))

host_statically('data')
host_statically('engine')
host_statically('pages/editor.html', '/editor.html')
host_statically('pages/editor.js', '/editor.js')

# Publishing puzzles
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

# Playing published puzzles
def play(display_hash):
  puzzle = db.session.query(Puzzle).filter(Puzzle.display_hash == display_hash).first()
  if not puzzle or not puzzle.data:
    return render_template('404_template.html', display_hash=display_hash)
  return render_template('play_template.html', test='foo', puzzle=puzzle.data)
application.add_url_rule('/play/<display_hash>', 'play', play)

if __name__ == '__main__':
  # Setting debug to True enables debug output. This line should be
  # removed before deploying a production app.
  # application.debug = True
  application.run()
