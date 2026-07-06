#!/usr/bin/env python3
"""
Parse VideoSource.json, download the first enabled source's manifest tar,
extract entries.json, pick the first 1080p-SDR video, and stream-play it
with ffplay (bundled with FFmpeg).

If FFmpeg is not installed, install it with:
    winget install --id Gyan.FFmpeg
"""

import json
import os
import shutil
import ssl
import subprocess
import sys
import tarfile
import urllib.request
from pathlib import Path
from urllib.parse import urlparse


CONFIG_FILE = Path("VideoSource.json")
CACHE_DIR = Path("cache")
PREFERRED_FORMATS = [
    "url-1080-H264",
    "url-1080-SDR",
    "url",
]


def find_ffplay() -> Path | None:
    """Locate the ffplay executable, searching PATH and common install dirs."""
    executable = "ffplay.exe" if sys.platform == "win32" else "ffplay"

    # 1. PATH
    path = shutil.which(executable)
    if path:
        return Path(path)

    # 2. Common Winget / default install locations on Windows
    if sys.platform == "win32":
        home = Path.home()
        candidates = [
            home / "AppData" / "Local" / "Microsoft" / "WinGet" / "Packages",
            home / "scoop" / "shims",
            home / "Chocolatey" / "bin",
            Path(r"C:\ffmpeg\bin"),
            Path(r"C:\ProgramData\chocolatey\bin"),
        ]
        for base in candidates:
            if not base.exists():
                continue
            for exe in base.rglob(executable):
                return exe

    return None


def download_file(url: str, dest: Path) -> Path:
    """Download a file if it doesn't already exist in the cache."""
    dest.parent.mkdir(parents=True, exist_ok=True)
    if dest.exists():
        print(f"[Cache hit] {dest}")
        return dest

    print(f"[Downloading] {url}")
    print(f"[Destination] {dest}")
    req = urllib.request.Request(
        url,
        headers={"User-Agent": "AerialStreamPlayer/1.0"},
    )
    ssl_context = ssl.create_default_context()
    ssl_context.check_hostname = False
    ssl_context.verify_mode = ssl.CERT_NONE

    with urllib.request.urlopen(req, context=ssl_context) as response, open(dest, "wb") as out:
        total = int(response.headers.get("Content-Length", 0))
        downloaded = 0
        block_size = 8192
        while True:
            chunk = response.read(block_size)
            if not chunk:
                break
            out.write(chunk)
            downloaded += len(chunk)
            if total:
                pct = downloaded / total * 100
                print(f"\r[Progress] {downloaded}/{total} bytes ({pct:.1f}%)", end="")
        print()
    return dest


def extract_tar(tar_path: Path, extract_to: Path) -> Path:
    """Extract a tar archive."""
    extract_to.mkdir(parents=True, exist_ok=True)
    print(f"[Extracting] {tar_path} -> {extract_to}")
    with tarfile.open(tar_path, "r") as tar:
        tar.extractall(path=extract_to, filter="data")
    return extract_to


def find_entries_json(root: Path) -> Path | None:
    """Locate entries.json inside the extracted directory tree."""
    for path in root.rglob("entries.json"):
        return path
    return None


def pick_first_video_url(entries: dict, format_keys: list[str]) -> str | None:
    """Return the first asset URL matching any of the requested formats."""
    for asset in entries.get("assets", []):
        for key in format_keys:
            url = asset.get(key)
            if url:
                label = asset.get("accessibilityLabel") or asset.get("localizedNameKey", "Unknown")
                print(f"[Selected] {label} — {key}")
                return url
    return None


def stream_play(url: str, ffplay: Path) -> None:
    """Stream-play a remote video URL with ffplay."""
    print(f"[Streaming] {url}")
    print("[Player] Press Q in the ffplay window to stop.")

    cmd = [
        str(ffplay),
        "-autoexit",
        "-infbuf",
        "-fflags", "nobuffer",
        "-flags", "low_delay",
        url,
    ]
    subprocess.run(cmd)


def main() -> None:
    # 0. Verify ffplay is available
    ffplay = find_ffplay()
    if ffplay is None:
        print("[Error] ffplay not found.")
        print("[Hint] Install FFmpeg with: winget install --id Gyan.FFmpeg")
        print("       Then restart your terminal and try again.")
        sys.exit(1)
    print(f"[Found ffplay] {ffplay}")

    if not CONFIG_FILE.exists():
        print(f"[Error] {CONFIG_FILE} not found.")
        sys.exit(1)

    # 1. Load VideoSource.json
    with open(CONFIG_FILE, "r", encoding="utf-8") as f:
        config = json.load(f)

    enabled_sources = [s for s in config.get("sources", []) if s.get("enabled")]
    if not enabled_sources:
        print("[Error] No enabled source found in VideoSource.json.")
        sys.exit(1)

    source = enabled_sources[0]
    print(f"[Source] {source['name']} — {source['description']}")

    # 2. Download the manifest tar
    manifest_url = source["manifestUrl"]
    tar_filename = Path(urlparse(manifest_url).path).name or "manifest.tar"
    tar_path = CACHE_DIR / tar_filename
    download_file(manifest_url, tar_path)

    # 3. Extract
    extract_dir = CACHE_DIR / tar_path.stem
    extract_tar(tar_path, extract_dir)

    # 4. Parse entries.json
    entries_path = find_entries_json(extract_dir)
    if entries_path is None:
        raise FileNotFoundError("entries.json not found in extracted tar")

    with open(entries_path, "r", encoding="utf-8") as f:
        entries = json.load(f)

    # 5. Pick first available video (prefer 1080p-SDR, then fall back)
    video_url = pick_first_video_url(entries, PREFERRED_FORMATS)
    if not video_url:
        print(f"[Error] No asset found with formats {PREFERRED_FORMATS}.")
        sys.exit(1)

    # 6. Stream play with ffplay
    stream_play(video_url, ffplay)


if __name__ == "__main__":
    main()
