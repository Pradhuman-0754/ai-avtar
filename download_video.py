import urllib.request
import os

video_url = "https://d-id-clips-prod.s3.us-west-2.amazonaws.com/google-oauth2%7C107640538731481856492/clp_TtKxR67i1u1elbwYC2OYY/v2_public_dylan_grey_suite_lobby%40veRJGS_iOD.mp4?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Credential=AKIA5CUMPJBIJ7CPKJNP%2F20261010%2Fus-west-2%2Fs3%2Faws4_request&X-Amz-Date=20261010T082727Z&X-Amz-Expires=86400&X-Amz-Signature=b2efdfd3fad757f3410ec99dc212fd44e7f5f13b130a9048b812790d357e8ed0&X-Amz-SignedHeaders=host&x-amz-checksum-mode=ENABLED&x-id=GetObject"

os.makedirs("assets", exist_ok=True)
dest_path = os.path.join("assets", "premium_watches_avatar.mp4")

print(f"Downloading video to {dest_path}...")
urllib.request.urlretrieve(video_url, dest_path)
size_mb = os.path.getsize(dest_path) / (1024 * 1024)
print(f"Downloaded successfully! File size: {size_mb:.2f} MB")
