"""Produce one offline HTML preview and the ZIP from the same current source."""
from pathlib import Path
from zipfile import ZipFile, ZIP_DEFLATED
import base64
import json
import mimetypes
import re

ROOT = Path(__file__).resolve().parents[1]
DIST = ROOT / 'dist'

def data_url(path):
    # Windows MIME registries do not consistently recognize WebP or variable fonts.
    kinds = {'.webp': 'image/webp', '.woff2': 'font/woff2', '.svg': 'image/svg+xml', '.mp4': 'video/mp4'}
    kind = kinds.get(path.suffix) or mimetypes.guess_type(path.name)[0] or 'application/octet-stream'
    return f'data:{kind};base64,' + base64.b64encode(path.read_bytes()).decode('ascii')

def standalone():
    html = (DIST / 'index.html').read_text(encoding='utf-8')
    assets = {path.relative_to(DIST).as_posix(): data_url(path)
              for path in (DIST / 'assets').rglob('*')
              if path.is_file() and path.suffix in ('.webp', '.woff2', '.svg', '.mp4') and 'frames' not in path.parts}
    scripts = re.findall(r'<script src="([^"]+)" defer></script>', html)
    html = re.sub(r'\s*<script src="[^"]+" defer></script>', '', html)
    html = re.sub(r'\s*<link rel="preload"[^>]+>', '', html)
    for stylesheet in ('assets/vendor/lenis.css', 'styles.css'):
        css = (DIST / stylesheet).read_text(encoding='utf-8')
        for name, embedded in assets.items():
            css = css.replace(name, embedded)
        html = html.replace(f'<link rel="stylesheet" href="{stylesheet}">', f'<style>{css}</style>')
    # No base element: inline SVG fragments and local anchor links stay in this document.
    for name, embedded in assets.items():
        html = html.replace(f'="{name}"', f'="{embedded}"')
    html = html.replace('<html lang="fa"', '<html data-format="standalone" lang="fa"', 1)
    inline = '<script>window.SigariAssets=' + json.dumps(assets) + ';</script>\n'
    for script in scripts:
        code = (DIST / script).read_text(encoding='utf-8').replace('</script', '<\\/script')
        inline += '<script>\n' + code + '\n</script>\n'
    return html.replace('</body>', inline + '</body>')

if __name__ == '__main__':
    preview = standalone()
    (ROOT.parent / 'dr-sigari-preview.html').write_text(preview, encoding='utf-8', newline='\n')
    # The identical offline artifact is available for ordinary HTTP browser QA too.
    (DIST / 'preview.html').write_text(preview, encoding='utf-8', newline='\n')
    with ZipFile(ROOT.parent / 'dr-sigari-site.zip', 'w', ZIP_DEFLATED) as archive:
        for folder in ('dist', 'scripts', 'tests', '.openai'):
            for path in (ROOT / folder).rglob('*'):
                if path.is_file() and '__pycache__' not in path.parts:
                    archive.write(path, path.relative_to(ROOT).as_posix())
        for name in ('README.md', 'QA.md', '.gitignore'):
            archive.write(ROOT / name, name)
        archive.writestr('preview.html', preview)
    print('Generated offline previews and dr-sigari-site.zip from current source.')
