#!/usr/bin/env bash
# Build + publish a HorizonX Dashboard image release.
#
# Usage:
#   scripts/release.sh v0.3.2            # build, verify, publish
#   scripts/release.sh v0.3.2 --dry-run  # build + verify only, no publish
#
# Requires:
#   - docker (buildx optional; plain docker build used)
#   - gh CLI authenticated for zlnew/horizonx-dashboard
#
# Contracts:
#   1. Release asset is a `docker save | gzip` tarball named
#      horizonx-dashboard-<ver>-image.tar.gz — `horizonx install server`
#      fetches exactly this asset from the LATEST dashboard release and
#      `docker load`s it.
#   2. Image is dual-tagged :latest + :<ver> so compose defaults resolve.
#   3. SHA256SUMS shipped alongside.
set -euo pipefail

cd "$(dirname "$0")/.."   # repo root

VERSION="${1:?usage: scripts/release.sh vX.Y.Z [--dry-run]}"
DRY_RUN="${2:-}"
if [ -n "$DRY_RUN" ] && [ "$DRY_RUN" != "--dry-run" ]; then
  echo "unknown arg: $DRY_RUN (expected --dry-run)" >&2; exit 2
fi
[[ "$VERSION" =~ ^v[0-9]+\.[0-9]+\.[0-9]+$ ]] || { echo "version must look like v0.3.2" >&2; exit 2; }

REPO="zlnew/horizonx-dashboard"
OUT="/tmp/hx-dash-release-${VERSION}"
TARBALL="$OUT/horizonx-dashboard-${VERSION}-image.tar.gz"
IMG="horizonx-dashboard:${VERSION}"

# -- preflight ---------------------------------------------------------------
echo "== preflight =="
command -v docker >/dev/null || { echo "docker required" >&2; exit 1; }
command -v gh >/dev/null || { echo "gh CLI required" >&2; exit 1; }

if [ -z "$DRY_RUN" ]; then
  EXISTS=$(gh release view "$VERSION" --repo "$REPO" --json tagName --jq .tagName 2>/dev/null || true)
  [ -z "$EXISTS" ] || { echo "release $VERSION already exists — delete it first if you mean to re-publish" >&2; exit 1; }
fi

rm -rf "$OUT" && mkdir -p "$OUT"

# -- build -------------------------------------------------------------------
echo ""
echo "== 1. docker build (multi-stage: npm build -> nginx) =="
docker build -t "$IMG" . 2>&1 | tail -3

echo ""
echo "== 2. dual-tag :latest + :${VERSION} =="
docker tag "$IMG" horizonx-dashboard:latest

echo ""
echo "== 3. docker save | gzip =="
docker save horizonx-dashboard:latest "$IMG" | gzip > "$TARBALL"
ls -lh "$TARBALL"

# -- verify ------------------------------------------------------------------
echo ""
echo "== 4. verify: docker load round-trip =="
docker rmi "$IMG" horizonx-dashboard:latest >/dev/null 2>&1 || true
docker load < "$TARBALL" >/dev/null
docker images | grep horizonx-dashboard | head -3

echo ""
echo "== 5. verify: nginx config =="
docker run --rm --entrypoint nginx "$IMG" -t 2>&1 | tail -1

echo ""
echo "== 6. checksum =="
cd "$OUT"
sha256sum "$TARBALL" > SHA256SUMS
cat SHA256SUMS
sha256sum -c SHA256SUMS

echo ""
echo "== artifacts =="
ls -la "$OUT"

# -- publish -----------------------------------------------------------------
if [ -n "$DRY_RUN" ]; then
  echo ""
  echo "DRY-RUN: image built + verified, release NOT published."
  exit 0
fi

echo ""
echo "== 7. create GitHub release =="
BODY=$(mktemp)
cat > "$BODY" <<EOF
## $VERSION

$(git log --oneline "$(git tag --sort=-version:refname | head -1 2>/dev/null || echo HEAD~10)..HEAD" 2>/dev/null | sed 's/^/- /' | head -40 || true)

Image tarball (docker load) + SHA256SUMS. \`horizonx install server\` auto-fetches this from the latest dashboard release.
EOF

gh release create "$VERSION" --repo "$REPO" --title "$VERSION" --notes-file "$BODY" "$TARBALL" "$OUT/SHA256SUMS"
rm -f "$BODY"
echo ""
echo "✔ published: https://github.com/$REPO/releases/tag/$VERSION"
