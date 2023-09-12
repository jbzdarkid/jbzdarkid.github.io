from pathlib import Path
import os
import getpass
import subprocess
import sys

def gpg_decrypt(ciphertext, key):
    # For security reasons, GPG always prefers to read and write from files.
    tmp = os.environ.get('RUNNER_TEMP', Path.home() / 'AppData/Local/Temp')
    with open(f'{tmp}/ciphertext.txt', 'wb') as f:
        f.write(bytes.fromhex(ciphertext))
    with open(f'{tmp}/key.txt', 'w') as f:
        f.write(key)
    subprocess.run([
        'gpg', '--batch', '--yes', '--decrypt',
        '--passphrase-file', f'{tmp}/key.txt',
        '--output', f'{tmp}/plaintext.txt',
        f'{tmp}/ciphertext.txt', # Inexplicably, the input file must be the last option.
    ], check=True, stdout=subprocess.DEVNULL)
    with open(f'{tmp}/plaintext.txt', 'rb') as f:
        return f.read()


if __name__ == '__main__':
    display_hash = sys.argv[1]
    with open(f'play/{display_hash}.html', 'r', encoding='utf-8') as f:
      contents = f.read()
    ciphertext = contents[contents.index('<!-- ')+5:contents.index(' -->')]
    solution_path = gpg_decrypt(ciphertext, os.environ.get('SECRET', getpass.getpass('GPG key: ')))
    print(solution_path)

