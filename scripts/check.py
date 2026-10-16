"""Check the deployable static tree without a build or external dependencies."""
from pathlib import Path
from html.parser import HTMLParser
from urllib.parse import urlsplit, unquote
import json

ROOT = Path(__file__).resolve().parents[1]
DIST = ROOT / 'dist'

class Document(HTMLParser):
    def __init__(self):
        super().__init__()
        self.ids = []
        self.references = []
    def handle_starttag(self, tag, attributes):
        values = dict(attributes)
        if values.get('id'):
            self.ids.append(values['id'])
        for key in ('src', 'href'):
            if key in values:
                self.references.append(values[key])

document = Document()
document.feed((DIST / 'index.html').read_text(encoding='utf-8'))
errors = []
if len(document.ids) != len(set(document.ids)):
    errors.append('Duplicate HTML IDs')
for reference in document.references:
    parsed = urlsplit(reference)
    if parsed.scheme or parsed.netloc:
        continue
    if parsed.path and not (DIST / unquote(parsed.path)).is_file():
        errors.append('Missing local asset: ' + reference)
    if parsed.fragment and not parsed.path and parsed.fragment not in document.ids:
        errors.append('Missing target ID: ' + reference)
frames = list((DIST / 'assets/frames').glob('frame-*.webp'))
if len(frames) != 57:
    errors.append('The source video sequence must have 57 frames')
for index in range(1, 58):
    if not (DIST / f'assets/frames/frame-{index:03}.webp').is_file():
        errors.append('Missing sequence frame: ' + str(index))
manifest = json.loads((ROOT / '.openai/hosting.json').read_text(encoding='utf-8'))
if manifest.get('static', {}).get('directory') != 'dist':
    errors.append('Static directory is not dist')
if not manifest.get('project_id'):
    errors.append('No registered Site project ID')
if errors:
    raise SystemExit('\n'.join(errors))
print(f'PASS: {len(document.ids)} unique IDs, all HTML asset/anchor references, 57 frames and hosting manifest.')
