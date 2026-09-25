"""Local-only preview server, using an available port to avoid collisions."""
from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler
from pathlib import Path
import os
import webbrowser

os.chdir(Path(__file__).resolve().parent)
with ThreadingHTTPServer(('127.0.0.1', 0), SimpleHTTPRequestHandler) as server:
    url = f'http://127.0.0.1:{server.server_port}/'
    print(f'PARALLAX: {url}\n종료하려면 Control+C를 누르세요.', flush=True)
    webbrowser.open(url)
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        pass
