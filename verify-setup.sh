#!/bin/bash

# Pre-build Verification Script
# Run this before npm run build to catch common issues

echo "🔍 Pre-Build Verification"
echo "========================="
echo ""

ERRORS=0

# Check Node.js
echo "1️⃣  Checking Node.js..."
if ! command -v node &> /dev/null; then
    echo "   ❌ Node.js not found"
    ERRORS=$((ERRORS + 1))
else
    NODE_VERSION=$(node -v | sed 's/v//' | cut -d'.' -f1)
    if [ "$NODE_VERSION" -lt 18 ]; then
        echo "   ⚠️  Node.js version too old: $(node -v)"
        echo "      Need v18 or higher"
        ERRORS=$((ERRORS + 1))
    else
        echo "   ✅ Node.js: $(node -v)"
    fi
fi

# Check npm
echo "2️⃣  Checking npm..."
if ! command -v npm &> /dev/null; then
    echo "   ❌ npm not found"
    ERRORS=$((ERRORS + 1))
else
    echo "   ✅ npm: $(npm -v)"
fi

# Check node_modules
echo "3️⃣  Checking dependencies..."
if [ ! -d "node_modules" ]; then
    echo "   ❌ node_modules not found"
    echo "      Run: npm install"
    ERRORS=$((ERRORS + 1))
else
    echo "   ✅ node_modules exists"
    
    # Check key packages
    if [ ! -d "node_modules/playwright" ]; then
        echo "   ❌ playwright not installed"
        ERRORS=$((ERRORS + 1))
    fi
    
    if [ ! -d "node_modules/typescript" ]; then
        echo "   ❌ typescript not installed"
        ERRORS=$((ERRORS + 1))
    fi
    
    if [ ! -d "node_modules/@types/node" ]; then
        echo "   ⚠️  @types/node not installed"
        echo "      Run: npm install --save-dev @types/node"
        ERRORS=$((ERRORS + 1))
    fi
fi

# Check tsconfig.json
echo "4️⃣  Checking TypeScript config..."
if [ ! -f "tsconfig.json" ]; then
    echo "   ❌ tsconfig.json not found"
    ERRORS=$((ERRORS + 1))
else
    if grep -q '"DOM"' tsconfig.json; then
        echo "   ✅ tsconfig.json has DOM lib"
    else
        echo "   ⚠️  tsconfig.json missing DOM lib"
        echo "      Add 'DOM' to lib array in compilerOptions"
        ERRORS=$((ERRORS + 1))
    fi
fi

# Check source files
echo "5️⃣  Checking source files..."
REQUIRED_FILES=(
    "src/cli.ts"
    "src/capture-engine.ts"
    "src/selectors.ts"
    "src/dom-diff.ts"
    "src/types.ts"
    "src/instrumentation.ts"
    "src/trace-writer.ts"
)

for file in "${REQUIRED_FILES[@]}"; do
    if [ ! -f "$file" ]; then
        echo "   ❌ Missing: $file"
        ERRORS=$((ERRORS + 1))
    fi
done

if [ $ERRORS -eq 0 ]; then
    echo "   ✅ All source files present"
fi

# Check package.json
echo "6️⃣  Checking package.json..."
if [ ! -f "package.json" ]; then
    echo "   ❌ package.json not found"
    ERRORS=$((ERRORS + 1))
else
    echo "   ✅ package.json exists"
fi

echo ""
echo "========================="

if [ $ERRORS -eq 0 ]; then
    echo "✅ All checks passed!"
    echo ""
    echo "You can now run: npm run build"
else
    echo "❌ Found $ERRORS issue(s)"
    echo ""
    echo "Fix the issues above, then run this script again."
    echo ""
    echo "Quick fixes:"
    echo "  • Missing Node.js: https://nodejs.org"
    echo "  • Missing dependencies: npm install"
    echo "  • Missing @types/node: npm install --save-dev @types/node"
    exit 1
fi
