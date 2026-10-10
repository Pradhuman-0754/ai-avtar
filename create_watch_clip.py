import urllib.request
import json
import time

api_key = "Z29vZ2xlLW9hdXRoMnwxMDc2NDA1Mzg3MzE0ODE4NTY0OTJAYWtfb2lScktMemRIR1RhNkJzTmMxUVJx:ZmWVsd9464GrjrxyD-Oc1"

script_text = (
    "Welcome to the pinnacle of horology, where time is not merely counted, but revered. "
    "A premium timepiece is far more than an instrument; it is a symphony of micro-engineering, "
    "sculpted in hand-finished gold, platinum, and sapphire crystal. Inside, hundreds of mechanical "
    "components beat in flawless harmony, powered by centuries of master watchmaking heritage. "
    "From the mesmerizing dance of a tourbillon to the enduring legacy of a perpetual calendar, "
    "each second is an ode to human ingenuity. A true luxury watch does not just tell the time—it defines yours. "
    "Welcome to timeless perfection."
)

payload = {
    "script": {
        "type": "text",
        "subtitles": "false",
        "provider": {
            "type": "microsoft",
            "voice_id": "en-US-ChristopherNeural"
        },
        "input": script_text
    },
    "presenter_id": "v2_public_dylan_grey_suite_lobby@veRJGS_iOD",
    "config": {
        "fluent": "true",
        "pad_audio": "0.0"
    }
}

req = urllib.request.Request(
    "https://api.d-id.com/clips",
    data=json.dumps(payload).encode('utf-8'),
    headers={
        "Authorization": f"Basic {api_key}",
        "Content-Type": "application/json",
        "accept": "application/json"
    },
    method="POST"
)

try:
    with urllib.request.urlopen(req) as resp:
        res_data = json.loads(resp.read().decode('utf-8'))
        print("Clip creation initiated successfully!")
        print(json.dumps(res_data, indent=2))
        clip_id = res_data.get("id")
        
        # Polling status
        print(f"Polling status for clip {clip_id}...")
        for i in range(30):
            time.sleep(5)
            status_req = urllib.request.Request(
                f"https://api.d-id.com/clips/{clip_id}",
                headers={"Authorization": f"Basic {api_key}", "accept": "application/json"}
            )
            with urllib.request.urlopen(status_req) as s_resp:
                s_data = json.loads(s_resp.read().decode('utf-8'))
                status = s_data.get("status")
                print(f"[{i*5}s] Status: {status}")
                if status == "done":
                    print("Video is ready!")
                    print("Result URL:", s_data.get("result_url"))
                    print("Duration:", s_data.get("duration"))
                    with open("clip_result.json", "w") as f:
                        json.dump(s_data, f, indent=2)
                    break
                elif status == "error":
                    print("Failed with error:", s_data)
                    break
except urllib.error.HTTPError as e:
    print(f"HTTP Error: {e.code} {e.reason}")
    print(e.read().decode('utf-8'))
except Exception as e:
    print("Error:", e)
