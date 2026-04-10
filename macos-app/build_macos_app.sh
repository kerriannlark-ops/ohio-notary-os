#!/bin/zsh
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
BUILD_DIR="$ROOT_DIR/build"
APP_NAME="Notary OS Study Hub.app"
APP_DIR="$BUILD_DIR/$APP_NAME"
CONTENTS_DIR="$APP_DIR/Contents"
MACOS_DIR="$CONTENTS_DIR/MacOS"
RESOURCES_DIR="$CONTENTS_DIR/Resources"
ZIP_PATH="$BUILD_DIR/Notary OS Study Hub.zip"
APPLICATIONS_READY_DIR="$BUILD_DIR/Applications Ready"
SOURCE_PDF="/Users/kerriannlark/Desktop/NOTARY LICENSE COURSE/Study Guide with PowerPoint Handouts-2.pdf"
REPO_SOURCE_PDF="$ROOT_DIR/macos-app/SeededCourse/OhioNotaryCoursePacket.pdf"
SOURCE_JSON="$ROOT_DIR/macos-app/SeededCourse/notary-course-content.json"
ROADMAP_JSON="$ROOT_DIR/macos-app/SeededCourse/roadmap-content.json"
REVENUE_MD="$ROOT_DIR/macos-app/SeededCourse/ohio_notary_codex_revenue_ladder.md"
WEB_SOURCE_DIR="$ROOT_DIR/macos-app/WebApp"
LAUNCH_HELPER="$ROOT_DIR/macos-app/launch_regular_app.py"
NATIVE_LAUNCHER_SOURCE="$ROOT_DIR/macos-app/NativeLauncher.m"
WEBAPP_RESOURCES_DIR="$RESOURCES_DIR/WebApp"
SEEDED_DIR="$RESOURCES_DIR/SeededCourse"
EXECUTABLE_NAME="NotaryOSStudyHub"
EXECUTABLE_PATH="$MACOS_DIR/$EXECUTABLE_NAME"
PLIST_PATH="$CONTENTS_DIR/Info.plist"

rm -rf "$APP_DIR"
rm -f "$ZIP_PATH"
rm -rf "$APPLICATIONS_READY_DIR"
mkdir -p "$MACOS_DIR" "$RESOURCES_DIR" "$WEBAPP_RESOURCES_DIR" "$SEEDED_DIR" "$APPLICATIONS_READY_DIR"

if [ -f "$REPO_SOURCE_PDF" ]; then
  SOURCE_PDF="$REPO_SOURCE_PDF"
  echo "Using repo-stored private course PDF:"
  echo "  $SOURCE_PDF"
elif [ -f "$SOURCE_PDF" ]; then
  echo "Using local private course PDF:"
  echo "  $SOURCE_PDF"
else
  echo "Missing seeded course PDF." >&2
  echo "Expected one of:" >&2
  echo "  $REPO_SOURCE_PDF" >&2
  echo "  /Users/kerriannlark/Desktop/NOTARY LICENSE COURSE/Study Guide with PowerPoint Handouts-2.pdf" >&2
  exit 1
fi

if [ ! -f "$ROADMAP_JSON" ]; then
  echo "Missing roadmap content JSON at: $ROADMAP_JSON" >&2
  exit 1
fi

if [ ! -f "$REVENUE_MD" ]; then
  echo "Missing revenue ladder source markdown at: $REVENUE_MD" >&2
  exit 1
fi

if [ ! -f "$NATIVE_LAUNCHER_SOURCE" ]; then
  echo "Missing native launcher source at: $NATIVE_LAUNCHER_SOURCE" >&2
  exit 1
fi

PYTHONPYCACHEPREFIX=/tmp/pyc python3 "$ROOT_DIR/macos-app/build_course_content.py" --source "$SOURCE_PDF" --output "$SOURCE_JSON"
python3 "$ROOT_DIR/macos-app/generate_icon_assets.py"

if command -v xattr >/dev/null 2>&1; then
  xattr -cr "$ROOT_DIR/macos-app/AppIcon.iconset" || true
  xattr -cr "$ROOT_DIR/macos-app/AppIcon-master.png" || true
  xattr -cr "$ROOT_DIR/macos-app/AppIcon.icns" || true
fi

if command -v iconutil >/dev/null 2>&1; then
  iconutil -c icns "$ROOT_DIR/macos-app/AppIcon.iconset" -o "$ROOT_DIR/macos-app/AppIcon.icns" >/dev/null 2>&1 || true
fi

if [ ! -f "$SOURCE_JSON" ]; then
  echo "Missing generated study JSON at: $SOURCE_JSON" >&2
  exit 1
fi

cp -R "$WEB_SOURCE_DIR/"* "$WEBAPP_RESOURCES_DIR/"
cp "$LAUNCH_HELPER" "$RESOURCES_DIR/launch_regular_app.py"
chmod +x "$RESOURCES_DIR/launch_regular_app.py"
cp "$SOURCE_PDF" "$SEEDED_DIR/OhioNotaryCoursePacket.pdf"
cp "$SOURCE_JSON" "$SEEDED_DIR/notary-course-content.json"
cp "$ROADMAP_JSON" "$SEEDED_DIR/roadmap-content.json"
cp "$REVENUE_MD" "$SEEDED_DIR/ohio_notary_codex_revenue_ladder.md"
cp "$ROOT_DIR/macos-app/AppIcon.icns" "$RESOURCES_DIR/AppIcon.icns"

SOURCE_JSON_ENV="$SOURCE_JSON" WEBAPP_RESOURCES_DIR_ENV="$WEBAPP_RESOURCES_DIR" python3 - <<'PY'
import json
import os
from pathlib import Path
source = Path(os.environ['SOURCE_JSON_ENV'])
target = Path(os.environ['WEBAPP_RESOURCES_DIR_ENV']) / 'study-data.js'
data = json.loads(source.read_text(encoding='utf-8'))
target.write_text('window.NOTARY_COURSE_CONTENT = ' + json.dumps(data, ensure_ascii=False) + ';', encoding='utf-8')
PY

ROADMAP_JSON_ENV="$ROADMAP_JSON" WEBAPP_RESOURCES_DIR_ENV="$WEBAPP_RESOURCES_DIR" python3 - <<'PY'
import json
import os
from pathlib import Path
source = Path(os.environ['ROADMAP_JSON_ENV'])
target = Path(os.environ['WEBAPP_RESOURCES_DIR_ENV']) / 'roadmap-data.js'
data = json.loads(source.read_text(encoding='utf-8'))
target.write_text('window.NOTARY_ROADMAP_CONTENT = ' + json.dumps(data, ensure_ascii=False) + ';', encoding='utf-8')
PY

if ! command -v clang >/dev/null 2>&1; then
  echo "clang is required to build the native Mac window launcher." >&2
  exit 1
fi

clang -fobjc-arc \
  -framework Cocoa \
  -framework WebKit \
  "$NATIVE_LAUNCHER_SOURCE" \
  -o "$EXECUTABLE_PATH"
chmod +x "$EXECUTABLE_PATH"

cat > "$PLIST_PATH" <<PLIST
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>CFBundleDevelopmentRegion</key>
  <string>en</string>
  <key>CFBundleExecutable</key>
  <string>$EXECUTABLE_NAME</string>
  <key>CFBundleIdentifier</key>
  <string>com.kerriannlark.notaryos.studyhub</string>
  <key>CFBundleInfoDictionaryVersion</key>
  <string>6.0</string>
  <key>CFBundleName</key>
  <string>Notary OS Study Hub</string>
  <key>CFBundleDisplayName</key>
  <string>Notary OS Study Hub</string>
  <key>CFBundlePackageType</key>
  <string>APPL</string>
  <key>CFBundleShortVersionString</key>
  <string>1.1.0</string>
  <key>CFBundleVersion</key>
  <string>2</string>
  <key>CFBundleIconFile</key>
  <string>AppIcon.icns</string>
  <key>LSMinimumSystemVersion</key>
  <string>12.0</string>
  <key>LSApplicationCategoryType</key>
  <string>public.app-category.productivity</string>
</dict>
</plist>
PLIST

cp -R "$APP_DIR" "$APPLICATIONS_READY_DIR/"
ln -sfn /Applications "$APPLICATIONS_READY_DIR/Applications"
cat > "$APPLICATIONS_READY_DIR/README.txt" <<'TXT'
Drag "Notary OS Study Hub.app" into the "Applications" shortcut in this folder.
Double-click the app to launch the private study workspace.
This build does not require Xcode.
Includes roadmap tracking, dark mode, keyboard shortcuts, and a printable cram sheet.
This build opens in its own native Mac window and does not require Chrome.
TXT

ditto -c -k --sequesterRsrc --keepParent "$APP_DIR" "$ZIP_PATH"

echo "Built regular macOS app bundle at:"
echo "  $APP_DIR"
echo "Applications-ready folder:"
echo "  $APPLICATIONS_READY_DIR"
echo "Packaged zip at:"
echo "  $ZIP_PATH"
echo
echo "Privacy note:"
echo "  This build bundles private course content."
echo "  Keep GitHub Releases private if you upload this zip."
echo "Runtime note:"
echo "  This build uses a native macOS WebKit window instead of Chrome."
