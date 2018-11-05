from flask import Flask, send_from_directory
from os import walk
from wtforms import Form

application = Flask(__name__)
application.add_url_rule('/', 'root', lambda:send_from_directory('', 'index.html'))
@application.route('/publish', methods=['POST'])
def publish():
  print(request.form)
  """
  form = Form(request.form)
    if request.method == 'POST' and form.validate():
        user = User(form.username.data, form.email.data,
                    form.password.data)
        db_session.add(user)
        flash('Thanks for registering')
        return redirect(url_for('login'))
    return render_template('register.html', form=form)
  """
# application.add_url_rule('/publish.html', 'publish', publish, methods=['POST'])

# Host all static content.
def static_content_func(root, file):
  return lambda:send_from_directory(root, file)
for root, dirs, files in walk('.'):
  root = root.replace('\\', '/')[1:]
  for file in files:
    filename = f'{root}/{file}'
    ext = filename.rsplit('.', 1)[-1]
    if ext in ['js', 'html', 'css', 'ogg']:
      application.add_url_rule(filename, filename, static_content_func(root[1:], file))

# application.add_url_rule('/<username>', 'bar', body_template)

if __name__ == "__main__":
    # Setting debug to True enables debug output. This line should be
    # removed before deploying a production app.
    # application.debug = True
    application.run()
