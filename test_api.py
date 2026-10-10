import urllib.request
import urllib.error
import base64
import json

api_key = "Z29vZ2xlLW9hdXRoMnwxMDc2NDA1Mzg3MzE0ODE4NTY0OTJAYWtfb2lScktMemRIR1RhNkJzTmMxUVJx:ZmWVsd9464GrjrxyD-Oc1"

# Case 1: as-is base64 encoded
b64_1 = base64.b64encode(api_key.encode('utf-8')).decode('utf-8')
headers_1 = {
    "Authorization": f"Basic {b64_1}",
    "accept": "application/json"
}

print(f"Testing Basic {b64_1[:15]}...")

req = urllib.request.Request("https://api.d-id.com/credits", headers=headers_1)
try:
    with urllib.request.urlopen(req) as resp:
        print("Success with base64 encoded key! Status:", resp.status)
        print("Response:", resp.read().decode('utf-8'))
except urllib.error.HTTPError as e:
    print(f"HTTP Error: {e.code} {e.reason}")
    print(e.read().decode('utf-8'))
except Exception as e:
    print("Error:", e)

# Case 2: maybe it was already base64? (or apiKey as bearer?)
req2 = urllib.request.Request("https://api.d-id.com/credits", headers={"Authorization": f"Basic {api_key}", "accept": "application/json"})
try:
    with urllib.request.urlopen(req2) as resp:
        print("Success with direct key! Status:", resp.status)
        print("Response:", resp.read().decode('utf-8'))
except urllib.error.HTTPError as e:
    print(f"HTTP Error 2: {e.code} {e.reason}")
    print(e.read().decode('utf-8'))
except Exception as e:
    print("Error 2:", e)
