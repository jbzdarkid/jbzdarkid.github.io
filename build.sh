python scraper.py
ls
git config user.name "Travis CI"
git config user.email "<>"
git config push.default simple
git add feed.rss
git push "https://${GH_TOKEN}@github.com/jbzdarkid/jbzdarkid.github.io.git" master:master
