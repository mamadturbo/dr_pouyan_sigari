"""Local-only failure fixtures; never packaged in dist/."""
from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler
from pathlib import Path
from urllib.parse import urlsplit
import time

ROOT = Path(__file__).resolve().parents[1] / 'dist'

class Handler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(ROOT), **kwargs)

    def do_GET(self):
        requested = urlsplit(self.path).path
        scenario = None
        for name in ('reduced-motion', 'video-fail', 'slow-video', 'frames-fail', 'slow-frames'):
            prefix = f'/qa/{name}/'
            if requested.startswith(prefix):
                scenario = name
                requested = '/' + requested[len(prefix):]
                break
        self.path = requested
        if requested.endswith('/assets/doctor-turn-flow.mp4'):
            if scenario in ('video-fail', 'frames-fail'):
                self.send_error(503, 'Simulated video request failure')
                return
            if scenario in ('slow-video', 'slow-frames'):
                time.sleep(1.5)
        if scenario == 'reduced-motion' and requested in ('/', '/index.html'):
            html = (ROOT / 'index.html').read_text(encoding='utf-8')
            fixture = '''<script>
const nativeMatchMedia = window.matchMedia.bind(window);
window.matchMedia = query => {
  const result = nativeMatchMedia(query);
  return query === '(prefers-reduced-motion: reduce)'
    ? {matches:true, media:query, addEventListener(){}, removeEventListener(){}}
    : result;
};
</script>'''
            data = html.replace('<head>', '<head>' + fixture).encode('utf-8')
            self.send_response(200)
            self.send_header('Content-Type', 'text/html; charset=utf-8')
            self.send_header('Content-Length', str(len(data)))
            self.end_headers()
            self.wfile.write(data)
            return
        super().do_GET()

if __name__ == '__main__':
    print('QA preview: http://127.0.0.1:4174', flush=True)
    ThreadingHTTPServer(('127.0.0.1', 4174), Handler).serve_forever()
