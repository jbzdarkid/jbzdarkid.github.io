from flask import Flask, send_from_directory
from os import walk

def body_template(*args, **kwargs):
  if 'username' in kwargs:
    title = f'Hello, {kwargs["username"]}!'
  else:
    title = f'Hello, world!'

  return f'''
  <html>
  <head>
    <title>{title}</title>
  </head>
  <body>
  <p><em>Hint</em>: This is a RESTful web service! Append a username
    to the URL (for example: <code>/Thelonious</code>) to say hello to
    someone specific.</p>
  <p><a href="/">Back</a></p>
  </body>
  </html>'''

application = Flask(__name__)
application.add_url_rule('/', 'root', lambda:send_from_directory('', 'index.html'))
application.add_url_rule('/test.html', 'test', lambda:send_from_directory('', 'test.html'))
application.add_url_rule('/display.js', 'display', lambda:send_from_directory('', 'engine/display2.js'))
application.add_url_rule('/display2.js', 'display2', lambda:send_from_directory('engine', 'display2.js'))
# Host all static content.
def static_content_func(root, file):
  return lambda:send_from_directory(root, file)

for root, dirs, files in walk('.'):
  root = root.replace('\\', '/')[1:]
  for file in files:
    filename = f'{root}/{file}'
    ext = filename.rsplit('.', 1)[-1]
    if ext not in ['js', 'html', 'css', 'ogg']:
      continue
    application.add_url_rule(filename, filename, static_content_func(root[1:], file))

# application.add_url_rule('/<username>', 'bar', body_template)

if __name__ == "__main__":
    # Setting debug to True enables debug output. This line should be
    # removed before deploying a production app.
    application.debug = True
    application.run()
