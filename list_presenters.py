import urllib.request
import json

api_key = 'Z29vZ2xlLW9hdXRoMnwxMDc2NDA1Mzg3MzE0ODE4NTY0OTJAYWtfb2lScktMemRIR1RhNkJzTmMxUVJx:ZmWVsd9464GrjrxyD-Oc1'
req = urllib.request.Request('https://api.d-id.com/clips/presenters', headers={'Authorization': f'Basic {api_key}', 'accept': 'application/json'})
with urllib.request.urlopen(req) as resp:
    data = json.loads(resp.read().decode('utf-8'))
    for p in data.get('presenters', []):
        print(f"ID: {p.get('presenter_id')} | Name: {p.get('name')} | Gender: {p.get('gender')} | Image: {p.get('image_url')} | Thumb: {p.get('thumbnail_url')}")
