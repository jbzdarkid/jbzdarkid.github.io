import json
import os
import requests
import sys
import urllib
from pathlib import Path
from requests.adapters import HTTPAdapter

from validate import gpg_encrypt

def get_puzzles(*, order='asc', offset=0, limit=100):
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

def get_cell(grid, x, y):
    if y < 0 or y >= len(grid[0]):
        return None
    if len(grid) % 2 == 0: # Pillar
        x = x % len(grid)
    if x < 0 or x >= len(grid):
        return None
    return grid[x][y]

def is_line(cell):
    if not cell:
        return False
    if isinstance(cell, str): # ???
        return False
    color = cell.get('line', cell.get('color', 0))
    if isinstance(color, int) and color > 0 and color < 3: # 1: Non-symmetry, 2: Symmetry primary.
        return True
    return False

def get_adjacent_lines(grid, x, y):
    cell = get_cell(grid, x, y)
    if not cell:
        return 0

    adjacencies = 0
    if cell.get('end', None):
        # Endpoints are not true lines, but from a conceptual standpoint they represent an additional direction.
        adjacencies += 1

    if is_line(get_cell(grid, x - 1, y)): adjacencies += 1
    if is_line(get_cell(grid, x + 1, y)): adjacencies += 1
    if is_line(get_cell(grid, x, y - 1)): adjacencies += 1
    if is_line(get_cell(grid, x, y + 1)): adjacencies += 1

    return adjacencies

def get_solution_path(solution):
    j = json.loads(solution)
    if 'path' in j:
        return json.dumps(j['path'])

    grid = j['grid']
    start_point = None
    best_start_point = 99
    for x, row in enumerate(grid):
        for y, cell in enumerate(row):
            if is_line(cell) and cell.get('start', False):
                adjacencies = get_adjacent_lines(grid, x, y)
                if adjacencies < best_start_point:
                    start_point = {'x':x, 'y':y}
                    best_start_point = adjacencies
    if not start_point:
        raise ValueError('Could not find a traced start point')

    path = [start_point]
    pos = {'x': start_point['x'], 'y': start_point['y']}
    visited = set()

    for _ in range(1000):
        visited.add((pos['x'], pos['y']))

        options = []
        junction_options = []
        def handle_cell(x, y, dir):
            if (x, y) in visited:
                return
            cell = get_cell(grid, x, y)
            if not is_line(cell):
                return

            # Count the adjacenct cells with lines from this cell (also including endpoints).
            # When we're given the option between a junction (3-way intersection) and a line
            # we should always prefer the line.
            adjacencies = get_adjacent_lines(grid, x, y)

            if adjacencies == 2:
                options.append(dir)
            elif adjacencies == 3:
                junction_options.append(dir)
            else:
                raise ValueError(f'Following the path but somehow reached a dead end at {x} {y}: {adjacencies}')

        handle_cell(pos['x'] - 1, pos['y'], 1) # PATH_LEFT
        handle_cell(pos['x'] + 1, pos['y'], 2) # PATH_RIGHT
        handle_cell(pos['x'], pos['y'] - 1, 3) # PATH_TOP
        handle_cell(pos['x'], pos['y'] + 1, 4) # PATH_BOTTOM

        if len(options) == 1:
            option = options[0]
        elif len(junction_options) == 1:
            option = junction_options[0]
        elif len(options) == 2: # Some puzzles are cheating and have overlapping symmetrical startpoints.
            option = options[0]
        elif get_cell(grid, pos['x'], pos['y']).get('end', None):
            path.append(0)
            break
        else:
            raise ValueError(f'Could not find a forwards direction from {pos}')
        pos['x'] += [None, -1, 1, 0, 0][option]
        pos['y'] += [None, 0, 0, -1, 1][option]
        path.append(option)

    else:
        raise ValueError(f'Infinite loop while evaluating path, currently: {path}')

    return json.dumps(path)

if __name__ == '__main__':
    offset = 0 if len(sys.argv) <= 1 else int(sys.argv[1])
    limit = 100 if len(sys.argv) <= 2 else int(sys.argv[2])

    puzzles = get_puzzles(order='desc', offset=offset, limit=limit)[::-1]

    puzzle_list = Path('puzzle_list.js').open('r', encoding='utf-8').read().split('\n')
    puzzle_ids = {row[1:9] for row in puzzle_list}

    for puzzle in puzzles:
        display_hash = puzzle['display_hash']
        if display_hash in puzzle_ids:
            continue
        print(f'Converting puzzle {display_hash}')

        print('Computing solution path...')
        try:
            solution_path = get_solution_path(puzzle['solution_json'])
        except Exception as e:
            import traceback
            traceback.print_exc()
            print(f'Failed to compute solution path for puzzle for puzzle {display_hash}: {e}')
            solution_path = 'error'

        # Encrypt this since we'll be saving it directly on the page
        solution_path = gpg_encrypt(solution_path, os.environ.get('SECRET'))

        # Different escapes depending on the context
        title_html = puzzle['title'].replace('<', '&lt;').replace('>', '&gt;').replace('"', '&quot;')
        title_js   = puzzle['title'].replace('"', '\\"')
        title_py   = puzzle['title'].replace('"', '\\"')

        image_url = f'images/{display_hash}.png'
        page_url = f'play/{display_hash}.html'

        print('Downloading image...')
        urllib.request.urlretrieve(puzzle['url'], image_url)

        print('Creating puzzle page...')
        contents = open('.github/workflows/template_play.html', 'r', encoding='utf-8').read()
        contents = contents \
            .replace('%title_html%', title_html) \
            .replace('%title_js%', title_js) \
            .replace('%display_hash%', display_hash) \
            .replace('%image_url%', image_url) \
            .replace('%puzzle%', json.dumps(puzzle['puzzle_json'])) \
            .replace('%solution%', solution_path)
        with open(page_url, 'x', encoding='utf-8') as f:
            f.write(contents)

        puzzle_list.insert(1, f'"{display_hash}{title_py}",')

        with open('puzzle_list.js', 'w', encoding='utf-8') as f:
            f.write('\n'.join(puzzle_list))
