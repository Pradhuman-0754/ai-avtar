import shutil
import glob
import os

brain_dir = r"C:\Users\HP\.gemini\antigravity-ide\brain\13164274-7c58-4e0c-ae9e-b8a0a6dc2b66"
os.makedirs("assets", exist_ok=True)

# Find generated images
tourbillon = glob.glob(os.path.join(brain_dir, "luxury_tourbillon_watch_*.jpg"))
perpetual = glob.glob(os.path.join(brain_dir, "watch_perpetual_calendar_*.jpg"))
chronograph = glob.glob(os.path.join(brain_dir, "watch_royal_chronograph_*.jpg"))

if tourbillon:
    shutil.copy(tourbillon[-1], os.path.join("assets", "watch_tourbillon.jpg"))
    print("Copied watch_tourbillon.jpg")
if perpetual:
    shutil.copy(perpetual[-1], os.path.join("assets", "watch_perpetual.jpg"))
    print("Copied watch_perpetual.jpg")
if chronograph:
    shutil.copy(chronograph[-1], os.path.join("assets", "watch_chronograph.jpg"))
    print("Copied watch_chronograph.jpg")
