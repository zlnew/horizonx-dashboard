#!/usr/bin/env bash
# Build + publish a HorizonX Dashboard image release.
#
# Usage:
#   scripts/release.sh minor              # bump + build, verify, publish
#   scripts/release.sh v0.3.2            # explicit version (same as before)
#   scripts/release.sh minor --dry-run   # build + verify only, no publish
#
# Version semantics (semver 2.0.0, resolved from the latest git tag):
#   major  = breaking change (incompatible API contract, dropped feature)
#   minor  = backward-compatible new capability (new pages, new dialogs,
#            redesigns that change behavior)
#   patch  = bug fix or invisible refactor (fixes, wording, styling-only)
#   Explicit vX.Y.Z skips resolution and publishes exactly that version.
#
# package.json sync: this script keeps package.json's version equal to the
# released tag (it has drifted before — was still 0.3.1 at the v0.3.5 tag).
# In publish mode it writes a dedicated "chore: release vX.Y.Z" commit and
# pushes it, so the tag points at a commit that includes the bump. Dry-run
# does NOT touch the tree.
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
REPO_ROOT="$PWD"

# The branch releases tag. Default main, but this repo's flow ships FROM
# develop (PRs merge to develop; main is a stale mirror). Without an
# explicit target, gh release create tags origin/main — v0.5.0's tag landed
# on a pre-A3 commit because of exactly that (caught 2026-08-08).
RELEASE_BRANCH="${RELEASE_BRANCH:-$(git branch --show-current)}"
echo "== release target branch: $RELEASE_BRANCH =="

RESOLVE="${1:?usage: scripts/release.sh <major|minor|patch|vX.Y.Z> [--dry-run]}"
DRY_RUN="${2:-}"
if [ -n "$DRY_RUN" ] && [ "$DRY_RUN" != "--dry-run" ]; then
  echo "unknown arg: $DRY_RUN (expected --dry-run)" >&2; exit 2
fi

# -- resolve version ----------------------------------------------------------
# Accept a semver bump keyword or an explicit vX.Y.Z. Keywords compute the
# next version from the latest git tag (sorted as versions, not strings).
# Tags are fetched FIRST: a stale local tag list made `patch` resolve below
# an already-published release (caught 2026-08-08).
git fetch --tags origin -q 2>/dev/null || true
case "$RESOLVE" in
  v[0-9]*.[0-9]*.[0-9]*)
    VERSION="$RESOLVE"
    ;;
  major|minor|patch)
    LATEST=$(git tag --sort=-version:refname | head -1 || true)
    LATEST="${LATEST:-v0.0.0}"
    if [[ "$LATEST" =~ ^v([0-9]+)\.([0-9]+)\.([0-9]+)$ ]]; then
      MAJOR=${BASH_REMATCH[1]}; MINOR=${BASH_REMATCH[2]}; PATCH=${BASH_REMATCH[3]}
      case "$RESOLVE" in
        major) MAJOR=$((MAJOR+1)); MINOR=0; PATCH=0 ;;
        minor) MINOR=$((MINOR+1)); PATCH=0 ;;
        patch) PATCH=$((PATCH+1)) ;;
      esac
      VERSION="v${MAJOR}.${MINOR}.${PATCH}"
    else
      echo "cannot parse latest tag: $LATEST" >&2; exit 2
    fi
    echo "== version: $RESOLVE bump → $VERSION (latest tag: $LATEST) =="
    ;;
  *)
    echo "usage: scripts/release.sh <major|minor|patch|vX.Y.Z> [--dry-run]" >&2
    exit 2
    ;;
esac
[[ "$VERSION" =~ ^v[0-9]+\.[0-9]+\.[0-9]+$ ]] || { echo "resolved version invalid: $VERSION" >&2; exit 2; }

REPO="zlnew/horizonx-dashboard"
OUT="/tmp/hx-dash-release-${VERSION}"
TARBALL="$OUT/horizonx-dashboard-${VERSION}-image.tar.gz"
IMG="horizonx-dashboard:${VERSION}"

# -- sync package.json (publish only) -----------------------------------------
# package.json is the dashboard's source-of-truth version string (nothing in
# the build renders it today, but it must not lie). Write the bump as its own
# commit BEFORE the release tag so the tag includes the version bump.
if [ -z "$DRY_RUN" ]; then
  PKG_VERSION=$(node -p "require('./package.json').version" 2>/dev/null || true)
  if [ "$PKG_VERSION" != "${VERSION#v}" ]; then
    echo ""
    echo "== 0. sync package.json → ${VERSION#v} =="
    git diff --quiet -- package.json || { echo "package.json has uncommitted changes — commit or stash them first" >&2; exit 1; }
    node -e "const p=require('./package.json'); p.version='${VERSION#v}'; require('fs').writeFileSync('package.json', JSON.stringify(p, null, 2) + '\n')"
    git add package.json
    git commit -q -m "chore: release ${VERSION}"
    git push -q origin HEAD
    echo "  committed + pushed: chore: release ${VERSION}"
  else
    echo "== 0. package.json already at ${VERSION#v} — nothing to sync =="
  fi
fi

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
# basename only! sha256sum "$TARBALL" (absolute) would write the full temp
# path into SHA256SUMS; the installer (verifySHA256SUMS) matches on
# filepath.Base() and can never resolve a full path. This bug shipped in
# v0.3.2 (installer: "SHA256SUMS has no entry for <basename>"). Glob like
# the server script so the filename field is always the basename.
sha256sum "$(basename "$TARBALL")" > SHA256SUMS
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

$(git -C "$REPO_ROOT" log --oneline "$(git -C "$REPO_ROOT" tag --sort=-version:refname | head -1 2>/dev/null || echo HEAD~10)..HEAD" 2>/dev/null | sed 's/^/- /' | head -40 || true)

Image tarball (docker load) + SHA256SUMS. \`horizonx install server\` auto-fetches this from the latest dashboard release.
EOF

gh release create "$VERSION" --repo "$REPO" --title "$VERSION" --notes-file "$BODY" --target "$RELEASE_BRANCH" "$TARBALL" "$OUT/SHA256SUMS"
rm -f "$BODY"
echo ""
echo "✔ published: https://github.com/$REPO/releases/tag/$VERSION"
