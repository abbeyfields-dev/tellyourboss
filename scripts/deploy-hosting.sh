#!/usr/bin/env bash
# Export Boss-O-Rater at the domain root and deploy the Firebase
# project owned by founders@navayro.com (project ID: bossorater).
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
APP="$ROOT/frontend"
APP_JSON="$APP/app.json"
PROJECT="${FIREBASE_PROJECT:-bossorater-96d02}"

if [[ ! -f "$APP/package.json" ]]; then
  echo "Frontend not found at $APP" >&2
  exit 1
fi

restore_base_url() {
  node -e '
    const fs = require("fs");
    const file = JSON.parse(fs.readFileSync(process.argv[1], "utf8"));
    file.expo.experiments = file.expo.experiments || {};
    file.expo.experiments.baseUrl = "";
    fs.writeFileSync(process.argv[1], JSON.stringify(file, null, 2) + "\n");
  ' "$APP_JSON"
}

trap restore_base_url EXIT

echo "Exporting Boss-O-Rater for https://bossorater.com ..."
node -e '
  const fs = require("fs");
  const file = JSON.parse(fs.readFileSync(process.argv[1], "utf8"));
  file.expo.experiments = file.expo.experiments || {};
  file.expo.experiments.baseUrl = "";
  fs.writeFileSync(process.argv[1], JSON.stringify(file, null, 2) + "\n");
' "$APP_JSON"

(
  cd "$APP"
  npx expo export --platform web
)

echo "Deploying Hosting to Firebase project $PROJECT"
(
  cd "$ROOT"
  firebase deploy --only hosting --project "$PROJECT"
)

echo "Preview: https://${PROJECT}.web.app"
echo "Attach bossorater.com in Firebase Console → Hosting → Add custom domain."
