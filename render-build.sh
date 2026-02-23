#!/usr/bin/env bash
# ──────────────────────────────────────────────
# Render Build Script for AI Photo Booth Frontend
# ──────────────────────────────────────────────
# This script runs as the Build Command on Render.
#
# If Render environment variables are set, it writes them into .env
# so react-native-dotenv can inline them at build time.
# If they are NOT set, it keeps the existing .env file from the repo.
# ──────────────────────────────────────────────

set -e

# Only overwrite .env if Render env vars are actually configured
if [ -n "$SERVER_LINK" ]; then
  echo "📝 Writing .env from Render environment variables..."
  cat > .env <<EOF
SERVER_LINK=${SERVER_LINK}
CLOUDINARY_CLOUD_NAME=${CLOUDINARY_CLOUD_NAME}
CLOUDINARY_UPLOAD_PRESET=${CLOUDINARY_UPLOAD_PRESET}
REGION_S3=${REGION_S3}
BUCKET_NAME_S3=${BUCKET_NAME_S3}
ACCESS_KEY_ID_S3=${ACCESS_KEY_ID_S3}
SECRET_ACCESS_KEY_S3=${SECRET_ACCESS_KEY_S3}
EOF
  echo "✅ .env file created from Render env vars"
else
  echo "ℹ️  No Render env vars detected — using existing .env from repo"
fi

echo "📦 Installing dependencies..."
npm install

echo "🏗️  Building web app..."
npx expo export --platform web

# Ensure font files are in the dist output
echo "📋 Copying fonts to dist..."
mkdir -p dist/fonts
cp public/fonts/*.ttf dist/fonts/

echo "✅ Build complete! Output is in ./dist"
