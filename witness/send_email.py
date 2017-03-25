from base64 import b64encode
from Crypto.Cipher import AES
from Crypto.Hash import SHA256
from datetime import datetime
from email.mime.text import MIMEText
from os import getcwd, environ
from selenium.webdriver import PhantomJS
from smtplib import SMTP

driver = PhantomJS()
driver.set_window_size(1280, 720)
driver.get(getcwd()+'/witness/test.html')
puzzle = driver.find_element_by_id('meta')
puzzle.screenshot('temp.png')

sha = SHA256.new()
sha.update(environ['PASSWORD'])
key = sha.hexdigest()[:AES.block_size*2]
text = open('witness/emails.txt', 'rb').read()
iv = text[:AES.block_size]
cipher = text[AES.block_size:]
aes = AES.new(key, AES.MODE_CBC, iv)
plain = aes.decrypt(cipher).strip()

FROM = 'random.witness.puzzles@gmail.com'
DATE = datetime.today().strftime('%A, %B %d, %Y')
server = SMTP('smtp.gmail.com', 587)
server.ehlo()
server.starttls()
server.login(FROM, environ['PASSWORD'])

text = '<a href="jbzdarkid.github.io/index.html#1><img src="data:image/png;base64,%s"></a>' % b64encode(open('temp.png', 'rb').read())

for TO in plain.split(','):
	msg = MIMEText(text, 'html')
	# msg.add_header('Content-Type', 'text/html')
	msg['Subject'] = 'Witness puzzle for %s' % DATE
	msg['To'] = '%s <%s>' % (TO.split('@')[0], TO)
	msg['From'] = FROM
	msg['Date'] = DATE
	server.sendmail(FROM, TO, msg.as_string())

server.quit()
