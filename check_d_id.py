import urllib.request
import json

api_key = "Z29vZ2xlLW9hdXRoMnwxMDc2NDA1Mzg3MzE0ODE4NTY0OTJAYWtfb2lScktMemRIR1RhNkJzTmMxUVJx:ZmWVsd9464GrjrxyD-Oc1"

def check_endpoint(endpoint):
    req = urllib.request.Request(
        f"https://api.d-id.com/{endpoint}",
        headers={"Authorization": f"Basic {api_key}", "accept": "application/json"}
    )
    try:
        with urllib.request.urlopen(req) as resp:
            data = json.loads(resp.read().decode('utf-8'))
            print(f"=== {endpoint} ===")
            print(json.dumps(data, indent=2))
            return data
    except Exception as e:
        print(f"Error for {endpoint}: {e}")
        return None

check_endpoint("talks")
check_endpoint("clips")
check_endpoint("animations")
