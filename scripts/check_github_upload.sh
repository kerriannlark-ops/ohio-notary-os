#!/bin/zsh
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
MODE="${1:---private-repo}"

if [[ "$MODE" != "--private-repo" && "$MODE" != "--public-safe" ]]; then
  echo "Usage: ./scripts/check_github_upload.sh [--private-repo|--public-safe]" >&2
  exit 1
fi

cd "$ROOT_DIR"

echo "GitHub upload check mode: ${MODE#--}"
echo

tracked_pdfs="$(git ls-files '*.pdf')"
tracked_build="$(git ls-files 'build/*')"
tracked_apps="$(git ls-files '*.app')"
tracked_zips="$(git ls-files '*.zip')"
tracked_envs="$(git ls-files '.env*' | grep -v '^.env.example$' || true)"

failures=0

check_block() {
  local label="$1"
  local content="$2"
  if [[ -n "$content" ]]; then
    echo "Found tracked $label:"
    echo "$content"
    echo
    failures=1
  fi
}

if [[ "$MODE" == "--public-safe" ]]; then
  check_block "PDF files" "$tracked_pdfs"
else
  if [[ -n "$tracked_pdfs" ]]; then
    echo "Tracked PDF files allowed in private-repo mode:"
    echo "$tracked_pdfs"
    echo
  else
    echo "No tracked PDF files found."
    echo
  fi
fi

check_block "build artifacts under build/" "$tracked_build"
check_block ".app bundles" "$tracked_apps"
check_block ".zip archives" "$tracked_zips"
check_block ".env files" "$tracked_envs"

echo "Ignored build directory rule:"
git check-ignore -v build 2>/dev/null || echo "build is not currently ignored"
echo

if [[ "$MODE" == "--private-repo" ]]; then
  echo "Private-repo reminder:"
  echo "- Licensed course content may be stored in GitHub only if the repo stays private."
  echo "- Do not publish a public release that bundles the paid course packet unless you intend to distribute it."
  echo
fi

if [[ $failures -eq 1 ]]; then
  echo "Result: FAILED"
  exit 1
fi

echo "Result: PASSED"
