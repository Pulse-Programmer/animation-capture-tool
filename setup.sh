#!/bin/bash

# Animation Capture Tool - Setup Script

echo "🎬 Animation Capture Tool - Setup"
echo "=================================="
echo ""

# Check Node.js version
echo "📦 Checking Node.js version..."
if ! command -v node &> /dev/null; then
    echo "❌ Error: Node.js is not installed"
    echo "Please install Node.js 18+ from https://nodejs.org"
    exit 1
fi

node_version=$(node -v)
echo "✅ Node.js version: $node_version"

# Check npm
if ! command -v npm &> /dev/null; then
    echo "❌ Error: npm is not installed"
    exit 1
fi

npm_version=$(npm -v)
echo "✅ npm version: $npm_version"
echo ""

# Install dependencies
echo "📥 Installing dependencies..."
echo "   This may take a few minutes..."
npm install

if [ $? -ne 0 ]; then
    echo ""
    echo "❌ Error: Failed to install dependencies"
    echo ""
    echo "Troubleshooting:"
    echo "  1. Check your internet connection"
    echo "  2. Try: npm cache clean --force"
    echo "  3. Try: rm -rf node_modules package-lock.json && npm install"
    echo "  4. Check firewall/proxy settings"
    exit 1
fi

echo "✅ Dependencies installed"
echo ""

# Install Playwright browsers
echo "🌐 Installing Playwright browsers..."
echo "   Downloading Chromium (this may take a few minutes)..."
npx playwright install chromium

if [ $? -ne 0 ]; then
    echo ""
    echo "❌ Error: Failed to install Playwright browsers"
    echo ""
    echo "Troubleshooting:"
    echo "  1. Check your internet connection"
    echo "  2. Check disk space (need ~300MB)"
    echo "  3. Try: npx playwright install --force chromium"
    exit 1
fi

echo "✅ Playwright browsers installed"
echo ""

# Build TypeScript
echo "🔨 Building TypeScript..."
npm run build

if [ $? -ne 0 ]; then
    echo ""
    echo "❌ Error: Failed to build project"
    echo ""
    echo "Troubleshooting:"
    echo "  1. Check BUILD.md for detailed instructions"
    echo "  2. Ensure TypeScript is installed: npm list typescript"
    echo "  3. Try: npm install --save-dev typescript"
    echo "  4. Check tsconfig.json has 'lib': ['ES2020', 'DOM']"
    exit 1
fi

echo "✅ Build complete"
echo ""

# Create captures directory
echo "📁 Creating captures directory..."
mkdir -p captures

echo "✅ Captures directory created"
echo ""

# Optional: Link CLI globally
read -p "Would you like to install the CLI globally? (y/n) " -n 1 -r
echo ""
if [[ $REPLY =~ ^[Yy]$ ]]; then
    npm link
    if [ $? -eq 0 ]; then
        echo "✅ CLI installed globally"
        echo "   You can now use 'capture-anim' from anywhere"
    else
        echo "⚠️  Global install failed (might need sudo)"
        echo "   You can still use 'npm start' to run the tool"
    fi
else
    echo "ℹ️  Skipped global install"
    echo "   Use 'npm start' to run the tool locally"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🎉 Setup complete!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📖 Quick Start:"
echo ""
echo "  1. Start recording:"
echo "     npm start record https://example.com"
echo ""
echo "  2. Interact with the page"
echo "     (Click, hover, interact with elements)"
echo ""
echo "  3. Press Ctrl+C to stop recording"
echo ""
echo "  4. View results:"
echo "     npm start view ./captures/session_*"
echo ""
echo "  5. Export for AI:"
echo "     npm start export ./captures/session_* -f prompt"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📚 Documentation:"
echo "   • Quick start: QUICKSTART.md"
echo "   • Full guide:  README.md"
echo "   • Build help:  BUILD.md"
echo "   • AI prompts:  AI-PROMPT-TEMPLATES.md"
echo ""