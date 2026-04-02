#!/bin/zsh
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
BUILD_DIR="$ROOT_DIR/build"
APP_NAME="Notary OS Study Hub.app"
APP_DIR="$BUILD_DIR/$APP_NAME"
ZIP_PATH="$BUILD_DIR/Notary OS Study Hub.zip"
CONTENTS_DIR="$APP_DIR/Contents"
MACOS_DIR="$CONTENTS_DIR/MacOS"
RESOURCES_DIR="$CONTENTS_DIR/Resources"
SEEDED_DIR="$RESOURCES_DIR/SeededCourse"
APPLICATIONS_READY_DIR="$BUILD_DIR/Applications Ready"
MODULE_CACHE_DIR="$ROOT_DIR/.derivedData/ModuleCache"
SOURCE_PDF="/Users/kerriannlark/Desktop/Study Guide with PowerPoint Handouts-2.pdf"

rm -rf "$APP_DIR"
rm -f "$ZIP_PATH"
rm -rf "$APPLICATIONS_READY_DIR"
mkdir -p "$MACOS_DIR" "$RESOURCES_DIR" "$SEEDED_DIR" "$APPLICATIONS_READY_DIR" "$MODULE_CACHE_DIR"

python3 "$ROOT_DIR/macos-app/generate_icon_assets.py"
if command -v iconutil >/dev/null 2>&1; then
  iconutil -c icns "$ROOT_DIR/macos-app/AppIcon.iconset" -o "$ROOT_DIR/macos-app/AppIcon.icns"
fi

if [ ! -f "$SOURCE_PDF" ]; then
  echo "Missing seeded course PDF at: $SOURCE_PDF" >&2
  exit 1
fi

swiftc \
  -module-cache-path "$MODULE_CACHE_DIR" \
  -parse-as-library \
  "$ROOT_DIR/macos-app/Models.swift" \
  "$ROOT_DIR/macos-app/SharedTheme.swift" \
  "$ROOT_DIR/macos-app/Bootstrap.swift" \
  "$ROOT_DIR/macos-app/AppLogic.swift" \
  "$ROOT_DIR/macos-app/PDFKitBridge.swift" \
  "$ROOT_DIR/macos-app/WebViewBridge.swift" \
  "$ROOT_DIR/macos-app/Views.swift" \
  "$ROOT_DIR/macos-app/NotaryOSMac.swift" \
  -framework SwiftUI \
  -framework AppKit \
  -framework PDFKit \
  -framework WebKit \
  -framework SwiftData \
  -o "$MACOS_DIR/NotaryOSStudyHub"

cp "$ROOT_DIR/macos-app/Info.plist" "$CONTENTS_DIR/Info.plist"
cp "$ROOT_DIR/macos-app/AppIcon.icns" "$RESOURCES_DIR/AppIcon.icns"
cp "$SOURCE_PDF" "$SEEDED_DIR/OhioNotaryCoursePacket.pdf"

cp -R "$APP_DIR" "$APPLICATIONS_READY_DIR/"
ln -sfn /Applications "$APPLICATIONS_READY_DIR/Applications"
cat > "$APPLICATIONS_READY_DIR/README.txt" <<'TXT'
Drag "Notary OS Study Hub.app" into the "Applications" shortcut in this folder.
You can also double-click the app here to run it immediately.
TXT

ditto -c -k --sequesterRsrc --keepParent "$APP_DIR" "$ZIP_PATH"

echo "Built macOS app bundle at:"
echo "  $APP_DIR"
echo "Applications-ready folder:"
echo "  $APPLICATIONS_READY_DIR"
echo "Packaged zip at:"
echo "  $ZIP_PATH"
