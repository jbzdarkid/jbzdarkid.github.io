# -*- coding: utf-8 -*-
from urllib2 import urlopen
from re import finditer, search, DOTALL
from feedgen.feed import FeedGenerator

fg = FeedGenerator()
fg.id('http://us.battle.net/forums/en/overwatch/21446648/')
fg.title('Overwatch Beta Patches')
fg.author(name='darkid')
# fg.link(href='http://www.github.com/jbzdarkid/jbzdarkid.github.io', rel='alternate')
fg.logo('http://us.battle.net/forums/static/images/logos/logo-small-overwatch.png')
fg.subtitle('A Github-hosted RSS feed for the Overwatch Forums')
fg.link(href='http://jbzdarkid.github.io/feed.rss', rel='self')
fg.language('en')

rssfeed = fg.rss_str(pretty=True)

page = urlopen('http://us.battle.net/forums/en/overwatch/21446648/').read()

for match in finditer('<a class="ForumTopic.*?href="(.*?)(#post-\d*|)".*?<span class="ForumTopic-title".*?>(.*?)</span>.*?class="ForumTopic-author.*?>(.*?)</span>', page, DOTALL):
	fe = fg.add_entry()
	title = match.group(3).replace('–', '-')
	title = ''.join((c if ord(c) < 128 else ' ') for c in title) # Something funny happens with the dashes, this is me fixing that.
	fe.title(title.replace('  ', ' '))
	fe.author(name=match.group(4))
	url = 'http://us.battle.net'+match.group(1)
	subpage = urlopen(url).read()
	submatch = search('class="TopicPost-bodyContent" data-topic-post-body-content="true">(.*?)</div>', subpage, DOTALL)
	fe.description(description=submatch.group(1))

fg.rss_file('feed.rss')
