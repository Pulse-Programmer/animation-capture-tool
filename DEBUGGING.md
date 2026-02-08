# Debugging Guide - "No Interactions Captured"

## Symptoms

- You run the capture tool
- Browser opens and you interact with elements
- Terminal shows "Recording interactions..."
- But when you stop (Ctrl+C), you see:
  - 0 traces
  - 0 profiles
  - Empty or ⚠️ sessions

## Step-by-Step Debugging

### Step 1: Rebuild First

Always rebuild after updates:
```bash
npm run build
```

### Step 2: Test with Simple Page

Use the included test page:
```bash
# Option A: Serve the test page locally
python3 -m http.server 8000
# Then in another terminal:
npm start record http://localhost:8000/test-page.html

# Option B: Use file:// protocol
npm start record file://$(pwd)/test-page.html
```

**What to expect:**
```
🚀 Starting capture session: session_xyz
📍 Target URL: http://localhost:8000/test-page.html
🌐 Loading page...
✅ Page loaded. Recording interactions...
✓ Instrumentation verified: Instrumentation loaded successfully
💡 Interact with the page. Press Ctrl+C to stop.
   Watch for indicators: 👆 (click) 👉 (hover) ⌨️ (input)
```

**Key indicators:**
1. ✓ "Instrumentation verified" - This MUST appear
2. Emoji indicators when you interact (👆, 👉, etc.)

### Step 3: Interact Deliberately

On the test page:
1. **Click** a button - You should see: `👆 [time] click on button.test-button`
2. **Hover** the red box - You should see: `👉 [time] hover on div.hover-box`
3. **Click** input field - You should see: `👆 [time] click on input.input-field`

**If you DON'T see these emojis**, the instrumentation isn't working.

### Step 4: Check What You Got

```bash
# Stop with Ctrl+C
# Should show:
# 💾 Traces saved and processed
# ✅ Session complete: ./captures/session_xyz

# List sessions
npm start list

# Check files
ls -la ./captures/session_xyz/
# Should have:
# - session.json
# - traces.jsonl (with content)
# - ai-output.json
# - README.md

# Check trace content
cat ./captures/session_xyz/traces.jsonl
# Should have JSON lines
```

## Common Issues & Fixes

### Issue 1: No "Instrumentation verified" Message

**Problem:** The browser script isn't loading.

**Fix:**
```bash
# Check if instrumentation.ts has errors
npm run build 2>&1 | grep instrumentation

# If errors, fix them and rebuild
npm run build
```

### Issue 2: "Instrumentation verified" Shows But No Emoji Indicators

**Problem:** Events are captured but not displayed.

**Debug:**
1. Open browser console (F12)
2. Look for errors
3. Check if `window.__captureCallback` exists:
```javascript
console.log(typeof window.__captureCallback); // Should be "function"
```

### Issue 3: Emoji Indicators Show But traces.jsonl is Empty

**Problem:** Data isn't being written to file.

**Check:**
```bash
# Verify session directory exists
ls -la ./captures/

# Check permissions
ls -ld ./captures/

# Try creating a test file
touch ./captures/test.txt
```

**Fix:**
```bash
# Ensure captures directory is writable
chmod 755 ./captures
```

### Issue 4: Everything Works on Test Page But Not Real Sites

**Possible causes:**
1. **Content Security Policy (CSP)** - Some sites block script injection
2. **Same-Origin Policy** - Browser security
3. **Site-specific JavaScript conflicts**

**Solutions:**
```bash
# Try with different sites
npm start record https://example.com --timeout 90000
npm start record https://httpbin.org --timeout 90000

# If those work, the problem is site-specific
```

### Issue 5: GitHub/Complex Sites Don't Capture

**Problem:** Modern frameworks override event handlers.

**Workaround:**
Try simpler sites that use standard DOM:
- https://example.com
- https://httpbin.org
- The included test-page.html
- Simple blog sites
- Documentation sites

## Verification Checklist

Run through this checklist:

1. [ ] `npm run build` completes without errors
2. [ ] Test page opens when you run capture
3. [ ] See "✓ Instrumentation verified" in terminal
4. [ ] See emoji (👆, 👉) when you interact
5. [ ] `traces.jsonl` has content after stopping
6. [ ] `ai-output.json` is created
7. [ ] `npm start list` shows ✅ instead of ⚠️

## Manual Test

To verify the tool works at all:

```bash
# 1. Rebuild
npm run build

# 2. Start simple web server
python3 -m http.server 8000 &

# 3. Capture test page
npm start record http://localhost:8000/test-page.html

# 4. Wait for "Instrumentation verified" message

# 5. Click the "Click Me!" button 3 times
# You should see:
# 👆 [time] click on button.test-button
# 👆 [time] click on button.test-button
# 👆 [time] click on button.test-button

# 6. Press Ctrl+C

# 7. Verify
npm start list
# Should show: Traces: 3 (or more)

# 8. View
npm start view ./captures/session_*

# 9. Export
npm start export ./captures/session_* -f prompt
```

If this works, the tool is fine. The issue is with specific websites.

## Known Limitations

### Won't Work On:
- Sites with strict CSP headers
- Sites using Shadow DOM extensively
- Some React/Vue apps with synthetic events
- iframes (content inside frames)
- Canvas-based UIs
- WebGL applications

### Works Best On:
- Standard HTML/CSS sites
- Sites using regular DOM events
- Documentation sites
- Blogs and landing pages
- The test page included with the tool

## Debug Mode

Add console logging to see what's happening:

**In browser console (F12):**
```javascript
// Check if capture is active
window.__captureCallback

// Manually trigger a test trace
window.__captureCallback({
  ts: Date.now(),
  type: 'test',
  message: 'Manual test from console'
});
```

You should see:
```
✓ Instrumentation verified: Manual test from console
```

## Getting More Information

**Check browser console for errors:**
```
F12 → Console tab
Look for red errors mentioning:
- "__captureCallback"
- "Capture"
- "sendTrace"
```

**Check terminal output carefully:**
```
Look for:
- "⚠️ Warning: Instrumentation may not be working"
- Any error messages
- Whether "✓ Instrumentation verified" appears
```

**Check actual trace files:**
```bash
# See what was actually captured
cat ./captures/session_*/traces.jsonl | jq .
# (install jq: brew install jq / apt install jq)

# Or without jq:
cat ./captures/session_*/traces.jsonl
```

## Still Not Working?

If after all this, you still get 0 traces:

1. **Verify Node.js version:**
   ```bash
   node --version  # Should be v18+
   ```

2. **Clean reinstall:**
   ```bash
   rm -rf node_modules dist captures
   npm install
   npm run build
   ```

3. **Try the absolute simplest test:**
   ```bash
   npm start record https://example.com --timeout 90000
   # Click anywhere on the page
   # Press Ctrl+C
   ```

4. **Check if Playwright is working:**
   ```bash
   npx playwright codegen https://example.com
   # This should open a browser with Playwright inspector
   # If this doesn't work, Playwright isn't installed correctly
   ```

5. **Reinstall Playwright:**
   ```bash
   npm uninstall playwright
   npm install playwright
   npx playwright install chromium
   ```

## Success Indicators

When everything is working, you'll see:

```bash
$ npm start record http://localhost:8000/test-page.html

🚀 Starting capture session: session_1234567890_abc
📍 Target URL: http://localhost:8000/test-page.html
🌐 Loading page...
   (This may take up to 60 seconds for complex sites)
✅ Page loaded. Recording interactions...
✓ Instrumentation verified: Instrumentation loaded successfully  ← IMPORTANT
💡 Interact with the page. Press Ctrl+C to stop.
   Watch for indicators: 👆 (click) 👉 (hover) ⌨️ (input)

👆 [12:34:56] click on button.test-button                        ← INTERACTION
   └─ Styles changed: transform                                  ← EFFECT
👆 [12:34:57] click on button.test-button
   └─ Styles changed: transform
👉 [12:34:58] hover on div.hover-box                             ← HOVER
   └─ Styles changed: background, transform, box-shadow
^C
🛑 Stopping capture session...
💾 Traces saved and processed
✅ Session complete: ./captures/session_1234567890_abc

$ npm start list

📊 Found 1 capture session(s):

1. ✅ session_1234567890_abc                                      ← GREEN CHECK
   Date: 1/29/2026, 12:34:56 AM
   URL: http://localhost:8000/test-page.html
   Profiles: 2 | Traces: 3                                       ← HAS DATA
   Path: ./captures/session_1234567890_abc
```

This is what success looks like!
