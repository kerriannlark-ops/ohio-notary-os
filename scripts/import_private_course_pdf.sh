#!/bin/zsh
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
DEFAULT_SOURCE="/Users/kerriannlark/Desktop/NOTARY LICENSE COURSE/Study Guide with PowerPoint Handouts-2.pdf"
SOURCE_PATH="${1:-$DEFAULT_SOURCE}"
TARGET_PATH="$ROOT_DIR/macos-app/SeededCourse/OhioNotaryCoursePacket.pdf"

if [ ! -f "$SOURCE_PATH" ]; then
  echo "Missing source PDF at:" >&2
  echo "  $SOURCE_PATH" >&2
  exit 1
fi

mkdir -p "$(dirname "$TARGET_PATH")"
cp "$SOURCE_PATH" "$TARGET_PATH"

echo "Imported private course PDF into repo storage:"
echo "  $TARGET_PATH"
echo
echo "Next steps:"
echo "  1. Review repo visibility before pushing."
echo "  2. Run ./scripts/check_github_upload.sh --private-repo"
echo "  3. Commit only if you want the licensed packet stored in GitHub."
