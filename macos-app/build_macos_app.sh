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
SOURCE_JSON="$ROOT_DIR/macos-app/SeededCourse/notary-course-content.json"
WEB_SOURCE_DIR="$ROOT_DIR/macos-app/WebApp"
LAUNCH_HELPER="$ROOT_DIR/macos-app/launch_regular_app.py"
WEBAPP_RESOURCES_DIR="$RESOURCES_DIR/WebApp"
SEEDED_DIR="$RESOURCES_DIR/SeededCourse"
EXECUTABLE_NAME="NotaryOSStudyHub"
EXECUTABLE_PATH="$MACOS_DIR/$EXECUTABLE_NAME"
PLIST_PATH="$CONTENTS_DIR/Info.plist"

rm -rf "$APP_DIR"
rm -f "$ZIP_PATH"
rm -rf "$APPLICATIONS_READY_DIR"
mkdir -p "$MACOS_DIR" "$RESOURCES_DIR" "$WEBAPP_RESOURCES_DIR" "$SEEDED_DIR" "$APPLICATIONS_READY_DIR"

if [ ! -f "$SOURCE_PDF" ]; then
  echo "Missing seeded course PDF at: $SOURCE_PDF" >&2
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

cat > "$EXECUTABLE_PATH" <<'APP'
#!/bin/zsh
set -euo pipefail
APP_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
RESOURCES_DIR="$APP_ROOT/Resources"
/usr/bin/python3 "$RESOURCES_DIR/launch_regular_app.py" "$RESOURCES_DIR/WebApp" >/tmp/notary_os_study_hub.log 2>&1 &
exit 0
APP
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
  <string>1.0.0</string>
  <key>CFBundleVersion</key>
  <string>1</string>
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
TXT

ditto -c -k --sequesterRsrc --keepParent "$APP_DIR" "$ZIP_PATH"

echo "Built regular macOS app bundle at:"
echo "  $APP_DIR"
echo "Applications-ready folder:"
echo "  $APPLICATIONS_READY_DIR"
echo "Packaged zip at:"
echo "  $ZIP_PATH"
