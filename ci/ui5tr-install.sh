#!/usr/bin/env bash
set -euo pipefail

# 1) Shared libraries headless Chrome needs (node:lts-bookworm doesn't ship them).
if command -v apt-get >/dev/null 2>&1; then
  apt-get update
  apt-get install -y --no-install-recommends \
    ca-certificates fonts-liberation wget \
    libasound2 libatk-bridge2.0-0 libatk1.0-0 libcairo2 libcups2 \
    libdbus-1-3 libexpat1 libgbm1 libglib2.0-0 libgtk-3-0 \
    libnspr4 libnss3 libpango-1.0-0 libx11-6 libxcb1 libxcomposite1 \
    libxdamage1 libxext6 libxfixes3 libxkbcommon0 libxrandr2
  rm -rf /var/lib/apt/lists/*
fi

# 2) Project dependencies from the lockfile.
npm ci

# 3) Chrome binary for Puppeteer.
npx puppeteer browsers install chrome