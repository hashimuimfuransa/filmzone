#!/bin/bash

# Build script for debugging React build issues
echo "Starting React build process..."

# Navigate to frontend directory
cd frontend

# Clean previous build
echo "Cleaning previous build..."
rm -rf build
rm -rf node_modules/.cache

# Install dependencies
echo "Installing dependencies..."
npm ci

# Check if index.html exists in public
echo "Checking public/index.html..."
if [ -f "public/index.html" ]; then
    echo "✅ public/index.html exists"
else
    echo "❌ public/index.html is missing!"
    exit 1
fi

# Run build
echo "Running build..."
npm run build

# Check if build was successful
if [ -d "build" ]; then
    echo "✅ Build directory created"
    if [ -f "build/index.html" ]; then
        echo "✅ build/index.html exists"
        echo "Build successful!"
    else
        echo "❌ build/index.html is missing!"
        echo "Build directory contents:"
        ls -la build/
        exit 1
    fi
else
    echo "❌ Build directory not created!"
    exit 1
fi
