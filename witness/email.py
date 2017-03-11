from selenium.webdriver import PhantomJS
from json import load
from os import getcwd, environ
from smtplib import SMTP

driver = PhantomJS()
driver.set_window_size(1280, 720)
print getcwd()+'index.html'
driver.get(getcwd()+'index.html')
driver.save_screenshot('temp.png')
system('gpg whatever')

FROM = environ['USERNAME']
TO = load('emails.txt')
msg = MimeMultipart()
msg['From'] = FROM
msg['To'] = ', '.join(TO)
msg['Date'] = 'blah'
msg['Subject'] = 'Witness puzzle for blah'
msg.attach(MIMEImage(open('temp.png', 'rb').read()))

server = SMTP('smtp.gmail.com', 587)
server.ehlo()
server.starttls()
server.login(environ['USERNAME'], environ['PASSWORD'])
server.sendmail(FROM, TO, msg.as_string())
server.quit()

