import re
import os

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
EXTS = ['.ts', '.tsx']

IMPORT_RE = re.compile(r"import\s+(?:type\s+)?\{([^}]+)\}\s+from\s+['\"](\.[^'\"]+)['\"]")
EXPORT_NAME_RE = re.compile(
    r"export\s+(?:async\s+)?(?:const|function|class|interface|type|enum)\s+([A-Za-z0-9_]+)"
)
EXPORT_BRACE_RE = re.compile(r"export\s*\{([^}]+)\}(?!\s*from)")
EXPORT_TYPE_BRACE_RE = re.compile(r"export\s+type\s*\{([^}]+)\}")


def resolve_file(base_dir, rel_path):
    candidate = os.path.normpath(os.path.join(base_dir, rel_path))
    if os.path.isfile(candidate):
        return candidate
    for ext in EXTS:
        if os.path.isfile(candidate + ext):
            return candidate + ext
    for ext in EXTS:
        idx = os.path.join(candidate, 'index' + ext)
        if os.path.isfile(idx):
            return idx
    return None


def get_exports(fpath):
    with open(fpath, 'r', encoding='utf-8') as f:
        content = f.read()
    names = set(EXPORT_NAME_RE.findall(content))
    for group in EXPORT_BRACE_RE.findall(content):
        for part in group.split(','):
            part = part.strip()
            if not part:
                continue
            name = part.split(' as ')[-1].strip()
            names.add(name)
    for group in EXPORT_TYPE_BRACE_RE.findall(content):
        for part in group.split(','):
            part = part.strip()
            if part:
                names.add(part.split(' as ')[-1].strip())
    if re.search(r"export\s+default\s", content):
        names.add('default')
    return names


def main():
    problems = []
    checked = 0
    for dirpath, dirnames, filenames in os.walk(ROOT):
        if 'node_modules' in dirpath or '/.git' in dirpath or '/scripts' in dirpath:
            continue
        for fname in filenames:
            if not fname.endswith(('.ts', '.tsx')):
                continue
            fpath = os.path.join(dirpath, fname)
            with open(fpath, 'r', encoding='utf-8') as f:
                content = f.read()
            for m in IMPORT_RE.finditer(content):
                names_raw, rel = m.groups()
                target = resolve_file(dirpath, rel)
                if not target:
                    continue  # already reported by check_imports.py
                exported = get_exports(target)
                checked += 1
                for raw_name in names_raw.split(','):
                    raw_name = raw_name.strip()
                    if not raw_name:
                        continue
                    local_name = raw_name.split(' as ')[0].strip()
                    if local_name not in exported:
                        problems.append(
                            (os.path.relpath(fpath, ROOT), local_name, os.path.relpath(target, ROOT))
                        )

    print(f"checked {checked} import statements")
    if problems:
        print(f"POSSIBLE MISSING EXPORTS ({len(problems)}):")
        for f, name, target in problems:
            print(f"  {f}: imports '{name}' from {target}, but no matching export found")
    else:
        print("every named import has a matching export")


if __name__ == '__main__':
    main()
