from base64 import b64encode
from Crypto.Cipher import AES
from Crypto.Hash import SHA256
from datetime import datetime
from email.mime.image import MIMEImage
from email.mime.multipart import MIMEMultipart
from os import getcwd, environ
from selenium.webdriver import PhantomJS
from smtplib import SMTP

driver = PhantomJS()
driver.set_window_size(1280, 720)
driver.get(getcwd()+'/witness/test.html')
puzzle = driver.find_element_by_id('meta')
print puzzle.size
puzzle.screenshot('temp.png')
print puzzle.screenshot_as_png('temp2.png')

# driver.save_screenshot('temp.png')

sha = SHA256.new()
sha.update(environ['PASSWORD'])
key = sha.hexdigest()[:AES.block_size*2]
text = open('witness/emails.txt', 'rb').read()
iv = text[:AES.block_size]
cipher = text[AES.block_size:]
aes = AES.new(key, AES.MODE_CBC, iv)
plain = aes.decrypt(cipher)

FROM = 'random.witness.puzzles@gmail.com'
DATE = datetime.today().strftime('%A, %B %d, %Y')
server = SMTP('smtp.gmail.com', 587)
server.ehlo()
server.starttls()
server.login(FROM, environ['PASSWORD'])


b64 = b64encode(open('temp.png', 'rb').read())
msg = '''
Subject: SUBJECT
Content-Type: multipart/related;
	type="text/html";
From: random.witness.puzzles <random.witness.puzzles@gmail.com>
Date: DATE
To: jbzdarkid <jbzdarkid@gmail.com>

Content-Type: text/html;
	charset=us-ascii
<html><body><a href="jbzdarkid.github.io/index.html#1><object id="puzzle_id_1"></object></a></body></html>

Content-Transfer-Encoding: base64
Content-Disposition: inline;
	filename=temp.png
Content-Type: application/png;
	x-unix-mode=0644;
	name="Puzzle for DATE"
Content-Id: <puzzle_id_1>

'''+b64

server.sendmail(FROM, 'jbzdarkid@gmail.com', msg.as_string())

for TO in plain.split(','):
	msg = MIMEMultipart()
	msg['From'] = FROM
	msg['To'] = '%s <%s>' % (TO.split('@')[0], TO)
	# msg['Date'] = DATE
	msg['Subject'] = 'Witness puzzle for %s' % DATE
	msg.attach(MIMEImage(open('temp.png', 'rb').read()))
	print msg
	server.sendmail(FROM, TO, msg.as_string())

server.quit()
