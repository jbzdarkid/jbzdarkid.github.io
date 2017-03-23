from selenium.webdriver import PhantomJS
from os import getcwd, environ
from Crypto.Cipher import AES
from Crypto.Hash import SHA256
from smtplib import SMTP

driver = PhantomJS()
driver.set_window_size(1280, 720)
print getcwd()+'/witness/index.html'
driver.get(getcwd()+'/witness/index.html')
driver.save_screenshot('temp.png')

sha = SHA256.new()
sha.update(environ['PASSWORD'])
key = sha.hexdigest()[:AES.block_size*2]
text = open('emails.txt', 'rb').read()
iv = text[:AES.block_size]
cipher = text[AES.block_size:]
aes = AES.new(key, AES.MODE_CBC, iv)
plain = aes.decrypt(cipher)

FROM = environ['USERNAME']
server = SMTP('smtp.gmail.com', 587)
server.ehlo()
server.starttls()
server.login(environ['USERNAME'], environ['PASSWORD'])

for to in plain.split('\n'):
	to = to.strip()
	msg = MimeMultipart()
	msg['From'] = FROM
	msg['To'] = ', '.join(TO)
	msg['Date'] = 'blah'
	msg['Subject'] = 'Witness puzzle for blah'
	msg.attach(MIMEImage(open('temp.png', 'rb').read()))
	server.sendmail(FROM, TO, msg.as_string())

server.quit()
