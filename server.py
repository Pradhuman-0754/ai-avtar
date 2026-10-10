import http.server
import socketserver
import urllib.request
import urllib.error
import json
import os
import sys

PORT = 8080
API_KEY = "Z29vZ2xlLW9hdXRoMnwxMDc2NDA1Mzg3MzE0ODE4NTY0OTJAYWtfb2lScktMemRIR1RhNkJzTmMxUVJx:ZmWVsd9464GrjrxyD-Oc1"

class LuxuryWatchHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        # Enable CORS and disable aggressive caching for dev
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type, Authorization')
        super().end_headers()

    def do_OPTIONS(self):
        self.send_response(200)
        self.end_headers()

    def do_GET(self):
        if self.path == '/api/credits':
            self.handle_get_credits()
        elif self.path == '/api/presenters':
            self.handle_get_presenters()
        elif self.path.startswith('/api/clip-status/'):
            clip_id = self.path.split('/')[-1]
            self.handle_clip_status(clip_id)
        else:
            # Normal static file serving
            super().do_GET()

    def do_POST(self):
        if self.path == '/api/generate-clip':
            content_length = int(self.headers.get('Content-Length', 0))
            body = self.rfile.read(content_length).decode('utf-8')
            self.handle_generate_clip(body)
        else:
            self.send_error(404, "Endpoint not found")

    def handle_get_credits(self):
        try:
            req = urllib.request.Request(
                "https://api.d-id.com/credits",
                headers={"Authorization": f"Basic {API_KEY}", "accept": "application/json"}
            )
            with urllib.request.urlopen(req) as resp:
                data = resp.read()
                self.send_response(200)
                self.send_header('Content-Type', 'application/json')
                self.end_headers()
                self.wfile.write(data)
        except urllib.error.HTTPError as e:
            self.send_response(e.code)
            self.send_header('Content-Type', 'application/json')
            self.end_headers()
            self.wfile.write(e.read())
        except Exception as e:
            self.send_response(500)
            self.send_header('Content-Type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps({"error": str(e)}).encode('utf-8'))

    def handle_get_presenters(self):
        try:
            req = urllib.request.Request(
                "https://api.d-id.com/clips/presenters",
                headers={"Authorization": f"Basic {API_KEY}", "accept": "application/json"}
            )
            with urllib.request.urlopen(req) as resp:
                data = resp.read()
                self.send_response(200)
                self.send_header('Content-Type', 'application/json')
                self.end_headers()
                self.wfile.write(data)
        except urllib.error.HTTPError as e:
            self.send_response(e.code)
            self.send_header('Content-Type', 'application/json')
            self.end_headers()
            self.wfile.write(e.read())
        except Exception as e:
            self.send_response(500)
            self.send_header('Content-Type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps({"error": str(e)}).encode('utf-8'))

    def handle_clip_status(self, clip_id):
        try:
            req = urllib.request.Request(
                f"https://api.d-id.com/clips/{clip_id}",
                headers={"Authorization": f"Basic {API_KEY}", "accept": "application/json"}
            )
            with urllib.request.urlopen(req) as resp:
                data = resp.read()
                self.send_response(200)
                self.send_header('Content-Type', 'application/json')
                self.end_headers()
                self.wfile.write(data)
        except urllib.error.HTTPError as e:
            self.send_response(e.code)
            self.send_header('Content-Type', 'application/json')
            self.end_headers()
            self.wfile.write(e.read())
        except Exception as e:
            self.send_response(500)
            self.send_header('Content-Type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps({"error": str(e)}).encode('utf-8'))

    def handle_generate_clip(self, body_str):
        try:
            data = json.loads(body_str)
            script_text = data.get('script', '')
            presenter_id = data.get('presenter_id', 'v2_public_dylan_grey_suite_lobby@veRJGS_iOD')
            voice_id = data.get('voice_id', 'en-US-ChristopherNeural')

            payload = {
                "script": {
                    "type": "text",
                    "subtitles": "false",
                    "provider": {
                        "type": "microsoft",
                        "voice_id": voice_id
                    },
                    "input": script_text
                },
                "presenter_id": presenter_id,
                "config": {
                    "fluent": "true",
                    "pad_audio": "0.0"
                }
            }

            req = urllib.request.Request(
                "https://api.d-id.com/clips",
                data=json.dumps(payload).encode('utf-8'),
                headers={
                    "Authorization": f"Basic {API_KEY}",
                    "Content-Type": "application/json",
                    "accept": "application/json"
                },
                method="POST"
            )

            with urllib.request.urlopen(req) as resp:
                res_data = resp.read()
                self.send_response(200)
                self.send_header('Content-Type', 'application/json')
                self.end_headers()
                self.wfile.write(res_data)
        except urllib.error.HTTPError as e:
            self.send_response(e.code)
            self.send_header('Content-Type', 'application/json')
            self.end_headers()
            self.wfile.write(e.read())
        except Exception as e:
            self.send_response(500)
            self.send_header('Content-Type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps({"error": str(e)}).encode('utf-8'))

def run_server():
    os.chdir(os.path.dirname(os.path.abspath(__file__)))
    socketserver.TCPServer.allow_reuse_address = True
    with socketserver.TCPServer(("", PORT), LuxuryWatchHandler) as httpd:
        print(f"Server started at http://localhost:{PORT}")
        sys.stdout.flush()
        httpd.serve_forever()

if __name__ == '__main__':
    run_server()
