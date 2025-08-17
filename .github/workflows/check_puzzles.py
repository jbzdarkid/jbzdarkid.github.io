import json
from pathlib import Path

puzzle_list = Path('puzzle_list.js').open('r', encoding='utf-8').read().split('\n')
puzzle_ids = {row[1:9] for row in puzzle_list}

expected = {
  'NEGATIONS_CANCEL_NEGATIONS': True,
  'SHAPELESS_ZERO_POLY': False,
  'PRECISE_POLYOMINOS': True,
  'FLASH_FOR_ERRORS': True,
  'FAT_STARTPOINTS': False,
  'CUSTOM_MECHANICS': False,
}

failed = []

for i, puzzle_id in enumerate(puzzle_ids):
  print(f'\r{i:04} of {len(puzzle_ids)} ({len(failed)} failed)', end='', flush=True)
  p = Path(f'play/{puzzle_id}.html')
  if not p.exists():
    continue
  with p.open('r', encoding='utf-8') as f:
    for line in f:
      if 'var puzzle = Puzzle.deserialize' in line:
        puzzle_contents = line[38:-2]
        puzzle = json.loads(json.loads(puzzle_contents))
        actual = puzzle.get('settings', {})
        # False if any setting is overwritten, or any unexpected setting is present
        if expected != (expected | actual):
          failed.append(puzzle_id)

print('\nFailed validation:')
for p in failed:
  print(p)
