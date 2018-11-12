from flask import Flask, send_from_directory
from os import walk

application = Flask(__name__)
application.add_url_rule('/', 'root', lambda:send_from_directory('', 'index.html'))

# Host all static content.
def static_content_func(root, file):
  return lambda:send_from_directory(root, file)
for root, dirs, files in walk('.'):
  root = root.replace('\\', '/')[1:]
  for file in files:
    if 'templates' in root: # TODO: This is a hack
      continue
    filename = f'{root}/{file}'
    ext = filename.rsplit('.', 1)[-1]
    if ext in ['js', 'html', 'css', 'ogg']:
      application.add_url_rule(filename, filename, static_content_func(root[1:], file))

if __name__ == "__main__":
  # Setting debug to True enables debug output. This line should be
  # removed before deploying a production app.
  # application.debug = True
  application.run()
