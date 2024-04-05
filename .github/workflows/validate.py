from pathlib import Path
import base64
import json
import os
import random
import subprocess

def gpg_encrypt(plaintext, key):
    # For security reasons, GPG always prefers to read and write from files.
    tmp = os.environ.get('RUNNER_TEMP', Path.home() / 'AppData/Local/Temp')
    with open(f'{tmp}/plaintext.txt', 'w') as f:
        f.write(plaintext)
    with open(f'{tmp}/key.txt', 'w') as f:
        f.write(key)
    subprocess.run([
        'gpg', '--batch', '--yes', '--symmetric',
        '--cipher-algo', 'AES256',
        '--passphrase-file', f'{tmp}/key.txt',
        '--output', f'{tmp}/ciphertext.txt',
        f'{tmp}/plaintext.txt', # Inexplicably, the input file must be the last option.
    ], check=True, stdout=subprocess.DEVNULL)
    with open(f'{tmp}/ciphertext.txt', 'rb') as f:
        return f.read().hex()


def validate_puzzle(puzzle):
    tempfile = Path('temp.html').resolve()
    with tempfile.open('w', encoding='utf-8') as f:
        validate_page = open('.github/workflows/template_validate.html', 'r', encoding='utf-8').read()
        validate_page = validate_page.replace('%input_data%', puzzle) # Let javascript do the object load; we'll be happy with whatever.
        f.write(validate_page)

    args = ['google-chrome-stable', tempfile.as_uri(), '--headless=new', '--dump-dom']
    dom = subprocess.run(args, text=True, encoding='utf-8', stdout=subprocess.PIPE, stderr=subprocess.DEVNULL, check=True).stdout

    tempfile.unlink() # So that it doesn't get committed

    data = dom[dom.index('!~!!~!!~!')+3:dom.index('@~@@~@@~@')]
    try:
        data = json.loads(data)
    except json.decoder.JSONDecodeError as e:
        print(e)
        print(data)
        exit(2)

    if not data.get('valid', False):
        print('Puzzle was not valid:', data['error'])
        exit(1)

    return data


def generate_display_hash(data, title):
    with Path('puzzle_list.js').open('r', encoding='utf-8') as f:
        puzzle_list = f.read().split('\n')

    # Check against the most recent 5 puzzles to see if this was a duplicate submission
    is_duplicate_puzzle = False
    for i in range(1, 6):
        puzzle_id = puzzle_list[i][1:9]
        puzzle_name = puzzle_list[i][9:-2]
        # For a 1:1 match we need the exact same puzzle body, with the same name and encoding.
        puzzle_json = json.loads(data['puzzle_json'])
        puzzle_json['name'] = puzzle_name 
        expected = json.dumps(json.dumps(puzzle_json, separators=(',', ':')))

        with Path(f'play/{puzzle_id}.html').open('r', encoding='utf-8') as f:
            print(f'Considering puzzle id {puzzle_id}')
            if expected in f.read():
                print(f'This puzzle has the same json as puzzle {i} ({puzzle_id}), deduplicating')
                is_duplicate_puzzle = True
                puzzle_list.pop(i)
                display_hash = puzzle_id
                break

    if not is_duplicate_puzzle:
        # This is a slightly updated display_hash solution -- rather than hashing the puzzle, I'm just generating a random ID every time.
        # I'm also just rerolling on duplicates, so the collision chance is mostly irrelevant.
        alphabet = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ' # [0-9A-Z] / [I1O0]
        puzzle_ids = {row[1:9] for row in puzzle_list}
        while 1:
            display_hash = ''.join(random.choices(alphabet, k=8))
            if display_hash not in puzzle_ids:
                break

    puzzle_list.insert(1, f'"{display_hash}{title}",')
    with Path('puzzle_list.js').open('w', encoding='utf-8') as f:
        f.write('\n'.join(puzzle_list))

    return display_hash


def save_puzzle_files(data):
    # Encrypt this since we'll be saving it directly on the page
    solution_path = gpg_encrypt(data['solution_path'], os.environ['SECRET'])

    # Different escapes depending on the context
    title_html = data['title'].replace('<', '&lt;').replace('>', '&gt;').replace('"', '&quot;')
    title_js   = data['title'].replace('"', '\\"')
    title_py   = data['title'].replace('"', '\\"')

    display_hash = generate_display_hash(data, title_py)
 
    image_url = f'images/{display_hash}.png'
    page_url = f'play/{display_hash}.html'

    print('Saving image...')
    with open(image_url, 'wb') as f:
        img_bytes = base64.b64decode(data['screenshot'][len('data:image/png;base64,'):])
        f.write(img_bytes)

    print('Creating puzzle page...')
    contents = open('.github/workflows/template_play.html', 'r', encoding='utf-8').read()
    contents = contents \
        .replace('%title_html%', title_html) \
        .replace('%title_js%', title_js) \
        .replace('%display_hash%', display_hash) \
        .replace('%image_url%', f'https://witnesspuzzles.com/{image_url}') \
        .replace('%puzzle%', json.dumps(data['puzzle_json'])) \
        .replace('%solution%', solution_path)
    with open(page_url, 'w', encoding='utf-8') as f:
        f.write(contents)

    # Needed to signal back to the frontend. Don't use the title because it's user-controlled, and thus an attack vector.
    with open(os.environ['GITHUB_OUTPUT'], 'w') as f:
      f.write(f'display_hash={display_hash}')

    return display_hash


if __name__ == '__main__':
    print('Validating puzzle...')
    data = validate_puzzle(os.environ['PUZZLE'])

    print('Puzzle validated, saving...')
    while True:
        display_hash = save_puzzle_files(data)

        subprocess.run(['git', 'config', '--global', 'user.email', 'jbzdarkid@users.noreply.github.com'], check=True)
        subprocess.run(['git', 'config', '--global', 'user.name', 'Validate and publish workflow'], check=True)
        subprocess.run(['git', 'config', '--global', 'core.editor', 'true'], check=True)
        subprocess.run(['git', 'add', '.'], check=True)
        subprocess.run(['git', 'commit', '-m', f'Published puzzle {display_hash}'], check=True)

        print(f'Created puzzle pages for display_hash={display_hash}, attempting to push...')
        output = subprocess.run(['git', 'push'])
        if output.returncode != 0:
            print('Git push failed:', output)
            subprocess.run(['git', 'fetch', 'origin', 'master'])
            subprocess.run(['git', 'rebase', 'origin/master', '-Xours']) # Discard our conflicting changes (like puzzle_list.js)
        else:
            break

