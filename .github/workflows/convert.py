import json
import os
import requests
import sys
import urllib
from pathlib import Path
from requests.adapters import HTTPAdapter

from validate import gpg_encrypt

def get_puzzles(order='asc', offset=0, limit=100):
    s = requests.Session()
    s.mount('https://witnesspuzzles.com', HTTPAdapter(max_retries=3))
    r = s.get('https://witnesspuzzles.com/pages/login.html')

    for line in r.text.split('\n'):
        if 'csrf_token' in line:
            csrf_token = line.split('value="')[1][:-2]
            break

    payload = {
        'username': os.environ['RDS_USERNAME'],
        'password': os.environ['RDS_PASSWORD'],
        'csrf_token': csrf_token,
    }
    headers = {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Referer': r.url,
    }
    r = s.post('https://witnesspuzzles.com/login', data=payload, headers=headers)

    payload = {
        'order': order,
        'offset': offset,
        'limit': limit,
    }

    r = s.get('https://witnesspuzzles.com/browse', params=payload, timeout=60)
    return r.json()

def get_solution_path(solution):
    j = json.loads(solution)
    if 'path' in j:
        return j['path']
        
    print(j.keys())
    exit()
    grid = j['grid']
    
    
    path = []
    


if __name__ == '__main__':
    offset = 0 if len(sys.argv) < 1 else int(sys.argv[1])
    limit = 100 if len(sys.argv) < 2 else int(sys.argv[2])
    puzzles = get_puzzles(offset, limit)
    puzzle_list = open('puzzle_list.js', 'r', encoding='utf-8').read().split('\n')

    for data in puzzles:
        print(data.keys())
        # Extract data from the data (in case we fail, not that we should)
        title = data['title']
        puzzle_json = data['puzzle_json']
        solution_path = get_solution_path(data['solution_json'])

        # Encrypt this since we'll be saving it directly on the page
        solution_path = gpg_encrypt(solution_path, os.environ['SECRET'])

        display_hash = data['display_hash']
        image_url = f'images/{display_hash}.png'
        page_url = f'play/{display_hash}.html'

        print('Downloading image...')
        urllib.request.urlretrieve(data['url'], image_url)

        print('Creating puzzle page...')
        contents = open('.github/workflows/template_play.html', 'r', encoding='utf-8').read()
        contents = contents \
            .replace('%title%', title) \
            .replace('%display_hash%', display_hash) \
            .replace('%image_url%', image_url) \
            .replace('%puzzle%', puzzle_json) \
            .replace('%solution%', solution_path)
        with open(page_url, 'x', encoding='utf-8') as f:
            f.write(contents)

        puzzle_list.insert(1, f'"{display_hash}{title}",')

    with open('puzzle_list.js', 'w', encoding='utf-8') as f:
        f.write('\n'.join(puzzle_list))


