#!/usr/bin/env bash
# CEREBRO — capture: screenshot CAPTURE_URL (desktop + mobile) into CAPTURE_DIR.
# Output stays outside the source tree; the app server is left running.
# Exit 75 = temporary navigation/browser infrastructure failure, 1 = script defect.
set -euo pipefail
cd "$(dirname "$0")"
/usr/bin/time -p test -n "${CAPTURE_URL:-}" || { echo "CAPTURE_URL is required" >&2; exit 1; }
/usr/bin/time -p test -n "${CAPTURE_DIR:-}" || { echo "CAPTURE_DIR is required" >&2; exit 1; }
/usr/bin/time -p test -n "${RUNTIME_DIR:-}" || { echo "RUNTIME_DIR is required" >&2; exit 1; }
/usr/bin/time -p mkdir -p "$CAPTURE_DIR"

CAPTURE_RC=0
if /usr/bin/time -p node "$RUNTIME_DIR/scripts/default-capture.mjs"; then
  CAPTURE_RC=0
else
  CAPTURE_RC=$?
fi

if /usr/bin/time -p test -f "$CAPTURE_DIR/final-desktop.png"; then
  /usr/bin/time -p ls -l "$CAPTURE_DIR/final-desktop.png"
else
  echo "missing $CAPTURE_DIR/final-desktop.png" >&2
  exit 1
fi
if /usr/bin/time -p test -f "$CAPTURE_DIR/final-mobile.png"; then
  /usr/bin/time -p ls -l "$CAPTURE_DIR/final-mobile.png"
else
  echo "missing $CAPTURE_DIR/final-mobile.png" >&2
  exit 1
fi
if /usr/bin/time -p test "$CAPTURE_RC" -ne 0; then
  echo "capture backend exited $CAPTURE_RC" >&2
  exit "$CAPTURE_RC"
fi
