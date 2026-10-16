"""Check the deployable static tree without a build or external dependencies."""
from pathlib import Path
from html.parser import HTMLParser
from urllib.parse import urlsplit, unquote
import json
import re

ROOT = Path(__file__).resolve().parents[1]
DIST = ROOT / 'dist'

class Document(HTMLParser):
    def __init__(self):
        super().__init__()
        self.ids = []
        self.references = []
        self.scripts = []
    def handle_starttag(self, tag, attributes):
        values = dict(attributes)
        if tag == 'script':
            self.scripts.append(values)
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
if any(script.get('type') == 'module' for script in document.scripts):
    errors.append('Local-file entrypoint must not depend on module scripts')
script_sources = [script.get('src') for script in document.scripts]
if script_sources.index('content.js') > script_sources.index('site.js'):
    errors.append('Content must load before application initialization')
for name in ('content.js', 'story-player.js', 'site.js'):
    source = (DIST / name).read_text(encoding='utf-8')
    if re.search(r'^\s*(?:import\s|export\s)', source, re.MULTILINE):
        errors.append('ES module syntax blocks direct file loading: ' + name)
for reference in document.references:
    parsed = urlsplit(reference)
    if parsed.scheme or parsed.netloc:
        continue
    if parsed.path and not (DIST / unquote(parsed.path)).is_file():
        errors.append('Missing local asset: ' + reference)
    if parsed.fragment and not parsed.path and parsed.fragment not in document.ids:
        errors.append('Missing target ID: ' + reference)
if not (DIST / 'assets/doctor-turn.mp4').is_file():
    errors.append('Native turn video is missing')
if script_sources.index('story-player.js') > script_sources.index('site.js'):
    errors.append('Playback engine must load before application initialization')
if '<canvas id="doctor-sequence"' in (DIST / 'index.html').read_text(encoding='utf-8'):
    errors.append('The doctor turn must use native video rather than scroll-scrubbed canvas frames')
manifest = json.loads((ROOT / '.openai/hosting.json').read_text(encoding='utf-8'))
if manifest.get('static', {}).get('directory') != 'dist':
    errors.append('Static directory is not dist')
if not manifest.get('project_id'):
    errors.append('No registered Site project ID')
preview = DIST / 'preview.html'
if preview.is_file():
    offline = Document()
    standalone = preview.read_text(encoding='utf-8')
    offline.feed(standalone)
    if '<base ' in standalone:
        errors.append('Offline preview must not redirect SVG fragment references with a base element')
    for reference in offline.references:
        parsed = urlsplit(reference)
        if parsed.path and not parsed.scheme and not parsed.netloc:
            errors.append('Offline preview still depends on a local file: ' + reference)
    if '"assets/doctor-turn.mp4": "data:video/mp4;base64,' not in standalone:
        errors.append('Offline preview is missing the embedded native video')
    if '"assets/frames/frame-' in standalone:
        errors.append('Offline preview must not load the obsolete frame sequence')
if errors:
    raise SystemExit('\n'.join(errors))
print(f'PASS: {len(document.ids)} unique IDs, local-file-safe scripts, HTML asset/anchor references, native video, offline preview and hosting manifest.')
