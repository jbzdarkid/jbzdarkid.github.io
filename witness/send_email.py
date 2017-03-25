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
print getcwd()+'/witness/index.html'
driver.get(getcwd()+'/witness/index.html')
puzzle = driver.find_element_by_id('puzzle')
print puzzle
driver.save_screenshot('temp.png')

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

for TO in plain.split(','):
	TO = '%s <%s>' % (TO.split('@')[0], TO)
	msg = MIMEMultipart()
	msg['From'] = FROM
	msg['To'] = TO
	msg['Date'] = DATE
	msg['Subject'] = 'Witness puzzle for %s' % DATE
	msg.attach(MIMEImage(open('temp.png', 'rb').read()))
	server.sendmail(FROM, TO, msg.as_string())

server.quit()
