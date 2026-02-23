#!/usr/bin/env bash
# ──────────────────────────────────────────────
# Render Build Script for AI Photo Booth Frontend
# ──────────────────────────────────────────────
# This script runs as the Build Command on Render.
# It writes Render's environment variables into a .env file
# so that react-native-dotenv can inline them at build time.
# ──────────────────────────────────────────────

set -e

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

echo "✅ .env file created"

echo "📦 Installing dependencies..."
npm install

echo "🏗️  Building web app..."
npx expo export --platform web

echo "✅ Build complete! Output is in ./dist"
