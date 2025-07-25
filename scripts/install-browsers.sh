#!/bin/bash

# Playwright Browser Installation Script
# This script attempts to install Playwright browsers with fallbacks

set -e

echo "🔧 Installing Playwright browsers..."

# First, try the standard installation
if npx playwright install chromium; then
  echo "✅ Successfully installed Playwright browsers"
  exit 0
fi

echo "⚠️  Standard installation failed, trying alternative methods..."

# Try with specific browser path
export PLAYWRIGHT_BROWSERS_PATH=$HOME/.cache/ms-playwright
if npx playwright install chromium; then
  echo "✅ Successfully installed Playwright browsers with custom path"
  exit 0
fi

# Try using system browser
echo "⚠️  Browser download failed, checking for system Chrome..."
if command -v google-chrome &> /dev/null || command -v chromium-browser &> /dev/null || command -v chromium &> /dev/null; then
  echo "✅ System Chrome/Chromium found"
  echo "💡 You can run tests with: PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1 pnpm e2e:web"
  exit 0
fi

echo "❌ Failed to install or find browsers"
echo "Please install Google Chrome or Chromium manually, or check your internet connection"
exit 1