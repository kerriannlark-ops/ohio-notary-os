#!/bin/zsh
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
APP_DIR="$ROOT_DIR/build/Notary OS Study Hub.app"
RESOURCES_DIR="$APP_DIR/Contents/Resources"
WEBAPP_DIR="$RESOURCES_DIR/WebApp"
HELPER="$RESOURCES_DIR/launch_regular_app.py"
NATIVE_BIN="$APP_DIR/Contents/MacOS/NotaryOSStudyHub"

printf '\n[1/5] Building native-window Mac app...\n'
"$ROOT_DIR/macos-app/build_macos_app.sh" >/tmp/notary_mac_build.log
cat /tmp/notary_mac_build.log | tail -n 8

printf '\n[2/5] Checking bundle outputs...\n'
test -d "$APP_DIR"
test -f "$NATIVE_BIN"
test -f "$RESOURCES_DIR/SeededCourse/notary-course-content.json"
test -f "$RESOURCES_DIR/SeededCourse/course-library-content.json"
test -f "$RESOURCES_DIR/SeededCourse/roadmap-content.json"
test -f "$WEBAPP_DIR/index.html"
test -f "$WEBAPP_DIR/app.js"
echo 'Bundle files present.'

printf '\n[3/5] Verifying native WebKit runtime...\n'
otool -L "$NATIVE_BIN" | grep -q 'WebKit'
if grep -Rqi 'Google Chrome\|Chromium\|Brave Browser\|Microsoft Edge\|Arc.app' "$RESOURCES_DIR"; then
  echo 'Found browser-specific runtime reference inside app resources.' >&2
  exit 1
fi
echo 'Native WebKit runtime confirmed; no Chrome dependency text found in bundled resources.'

printf '\n[4/5] Starting bundled local workspace server and checking key files...\n'
URL=$(python3 "$HELPER" --server-only "$WEBAPP_DIR")
python3 - <<PY
import sys, urllib.request
base = "$URL".rsplit('/', 1)[0]
paths = [
    '/index.html',
    '/study-data.js',
    '/library-data.js',
    '/roadmap-data.js',
    '/CourseLibrary/OhioNotaryCoursePacket.pdf',
]
for path in paths:
    with urllib.request.urlopen(base + path, timeout=3) as response:
        assert response.status == 200, (path, response.status)
print('Local workspace endpoints reachable.')
PY

printf '\n[5/5] Release QA complete.\n'
echo "App bundle: $APP_DIR"
echo "Local workspace URL: $URL"
