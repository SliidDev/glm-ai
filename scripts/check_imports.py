import re
import os

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
EXTS = ['.ts', '.tsx', '.js', '.jsx']

IMPORT_RE = re.compile(r"""from\s+['"](\.[^'"]+)['"]|import\(\s*['"](\.[^'"]+)['"]\s*\)""")

def resolve(base_dir, rel_path):
    candidate = os.path.normpath(os.path.join(base_dir, rel_path))
    if os.path.isfile(candidate):
        return True
    for ext in EXTS:
        if os.path.isfile(candidate + ext):
            return True
    if os.path.isdir(candidate):
        for ext in EXTS:
            if os.path.isfile(os.path.join(candidate, 'index' + ext)):
                return True
    return False

def main():
    problems = []
    scanned = 0
    for dirpath, dirnames, filenames in os.walk(ROOT):
        if 'node_modules' in dirpath or '/.git' in dirpath or '/scripts' in dirpath:
            continue
        for fname in filenames:
            if not fname.endswith(('.ts', '.tsx')):
                continue
            fpath = os.path.join(dirpath, fname)
            scanned += 1
            with open(fpath, 'r', encoding='utf-8') as f:
                content = f.read()
            for m in IMPORT_RE.finditer(content):
                rel = m.group(1) or m.group(2)
                if not resolve(dirpath, rel):
                    problems.append((os.path.relpath(fpath, ROOT), rel))

    print(f"scanned {scanned} files")
    if problems:
        print(f"UNRESOLVED IMPORTS ({len(problems)}):")
        for f, rel in problems:
            print(f"  {f}  ->  {rel}")
    else:
        print("all relative imports resolve OK")

if __name__ == '__main__':
    main()
