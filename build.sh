#!/bin/bash

echo "Starting Vercel build process..."

# Change to frontend directory
cd frontend

# Install dependencies
echo "Installing dependencies..."
npm ci

# Run build
echo "Running React build..."
npm run build

# Verify build output
if [ -f "build/index.html" ]; then
    echo "✅ Build successful - index.html found"
else
    echo "❌ Build failed - index.html not found"
    echo "Build directory contents:"
    ls -la build/
    exit 1
fi

echo "✅ Build completed successfully"
