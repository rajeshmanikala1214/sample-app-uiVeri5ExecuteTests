#!/usr/bin/env bash
#
# uiVeri5ExecuteTests -> installCommand
#
# uiVeri5 tests a RUNNING application; it does not serve the app itself. The
# default installCommand only installs the uiVeri5 tool, so we additionally:
#   1. install app dependencies (@ui5/cli, middleware) via npm ci,
#   2. install uiVeri5 globally (same as Piper's default installCommand), and
#   3. start ui5 serve so the Selenium sidecar's browser can load the app.
#
# Piper runs installCommand as one process (no shell), which is why this is a
# single script. The backgrounded server keeps running in the container and is
# used by the subsequent runCommand (uiVeri5).
#
set -euo pipefail

# 1) App dependencies (provides the ui5 binary and ui5.yaml middleware).
npm ci

# 2) uiVeri5 tool, installed globally -> /home/node/.npm-global/bin/uiveri5
#    (matches the step's default runCommand path).
npm install @ui5/uiveri5 --global --quiet

# 3) Serve the app. --accept-remote-connections is REQUIRED: by default ui5 serve
#    only accepts localhost, but the browser lives in the Selenium sidecar and
#    reaches this container via the docker network alias "uiVeri5".
nohup npx ui5 serve --port 8080 --accept-remote-connections >/tmp/ui5-serve.log 2>&1 &

# 4) Wait until the app answers before uiVeri5 starts (node-based check, so no
#    dependency on curl being present in the image).
for i in $(seq 1 30); do
  if node -e "require('http').get('http://localhost:8080/index.html',function(r){process.exit(r.statusCode<500?0:1)}).on('error',function(){process.exit(1)})" 2>/dev/null; then
    echo "ui5 serve is up on :8080"
    break
  fi
  sleep 1
done