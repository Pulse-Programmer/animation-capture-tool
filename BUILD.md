# Build Instructions

## Prerequisites

- Node.js 18+ (download from https://nodejs.org)
- npm (comes with Node.js)

## Installation Steps

### 1. Install Dependencies

```bash
cd animation-capture-tool
npm install
```

This will install:
- `playwright` - Browser automation
- `commander` - CLI framework
- `chalk` - Terminal colors
- `ora` - Spinners
- `@types/node` - TypeScript types for Node.js

### 2. Install Playwright Browsers

```bash
npx playwright install chromium
```

This downloads the Chromium browser that Playwright will use.

### 3. Build the Project

```bash
npm run build
```

This compiles TypeScript to JavaScript in the `dist/` folder.

### 4. Verify Installation

```bash
npm start record https://example.com
```

If a browser opens, you're good to go!

## Troubleshooting Build Errors

### Error: "Cannot find module 'playwright'"

**Solution:**
```bash
npm install playwright
```

### Error: "Cannot find name 'process'"

**Solution:**
```bash
npm install --save-dev @types/node
```

### Error: "Cannot find name 'Element', 'document', etc."

This means TypeScript doesn't have DOM types.

**Solution:** Check `tsconfig.json` includes DOM lib:
```json
{
  "compilerOptions": {
    "lib": ["ES2020", "DOM"]
  }
}
```

### Error: "npx: command not found"

**Solution:** Update npm:
```bash
npm install -g npm@latest
```

### Error: "Permission denied"

**Solution:** On Unix systems, you might need:
```bash
chmod +x setup.sh
./setup.sh
```

Or use sudo for global installs:
```bash
sudo npm install -g
```

## Development Mode

For active development, use:

```bash
# Watch mode (rebuilds on file changes)
npm run build -- --watch

# Or use ts-node directly (no build needed)
npx ts-node src/cli.ts record https://example.com
```

## Project Structure After Build

```
animation-capture-tool/
├── src/              # TypeScript source
├── dist/             # Compiled JavaScript (created after build)
│   ├── cli.js
│   ├── capture-engine.js
│   ├── selectors.js
│   ├── dom-diff.js
│   └── ...
├── node_modules/     # Dependencies (created after npm install)
├── captures/         # Output directory (created on first run)
└── package.json
```

## Clean Build

If you encounter persistent issues:

```bash
# Remove all build artifacts and dependencies
rm -rf node_modules dist package-lock.json

# Reinstall everything
npm install
npm run build
```

## Optional: Global Installation

To use `capture-anim` command globally:

```bash
npm link
```

Then you can run from anywhere:
```bash
capture-anim record https://example.com
```

To uninstall:
```bash
npm unlink
```

## Verification Checklist

After installation, verify:

- [ ] `node --version` shows v18 or higher
- [ ] `npm --version` shows v9 or higher
- [ ] `node_modules/` directory exists
- [ ] `dist/` directory exists after build
- [ ] `npm start record https://example.com` opens a browser

## Common Issues

### Issue: TypeScript errors about DOM types

The tool uses both Node.js types and DOM types (for browser instrumentation). Make sure `tsconfig.json` has:

```json
{
  "compilerOptions": {
    "lib": ["ES2020", "DOM"]
  }
}
```

### Issue: Playwright browser not found

Run:
```bash
npx playwright install chromium
```

### Issue: Build succeeds but CLI doesn't work

Make sure package.json has the correct bin path:
```json
{
  "bin": {
    "capture-anim": "./dist/cli.js"
  }
}
```

And the CLI file has the shebang:
```javascript
#!/usr/bin/env node
```

## Build Scripts Reference

```bash
# Build TypeScript
npm run build

# Run without building (development)
npm run dev

# Start CLI (requires build first)
npm start <command>

# Example commands
npm start record https://example.com
npm start view ./captures/session_*
npm start export ./captures/session_* -f prompt
```

## Next Steps

After successful build:
1. Read [QUICKSTART.md](./QUICKSTART.md) for first capture
2. Try [INSTALL.md](./INSTALL.md) for detailed usage
3. Check [README.md](./README.md) for full documentation

## Still Having Issues?

1. Check Node.js version: `node --version` (need 18+)
2. Clear npm cache: `npm cache clean --force`
3. Delete `node_modules` and reinstall
4. Check for firewall/antivirus blocking npm or Playwright
5. Try running with sudo/admin privileges (if permission errors)

## System Requirements

- **OS**: macOS, Linux, Windows 10+
- **RAM**: 4GB minimum, 8GB recommended
- **Disk**: 1GB free space (for Chromium + dependencies)
- **Network**: Internet connection for initial setup

## Success!

If build completes without errors, you should see:

```
> animation-capture-tool@1.0.0 build
> tsc

✓ Build complete!
```

You're now ready to capture animations!
