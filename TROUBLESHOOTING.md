# Troubleshooting Common Errors

## Error: "Timeout exceeded"

### Symptoms

```
❌ Error: page.goto: Timeout 30000ms exceeded.
```

### Why This Happens

Modern websites (especially GitHub, GitLab, complex SPAs) take longer than 30 seconds to fully load, particularly with:

- Slow internet connections
- Heavy JavaScript bundles
- Many network requests
- Geographic distance from servers

### Solutions

#### 1. **Increase Timeout (Recommended)**

```bash
# Default is 60 seconds, increase if needed
npm start record https://github.com --timeout 90000

# For very slow sites/networks
npm start record https://github.com --timeout 120000
```

#### 2. **Use Network Idle Wait**

```bash
# Wait for all network requests to complete
npm start record https://github.com --wait-idle --timeout 90000
```

#### 3. **Combine Both for Best Results**

```bash
# Most reliable for complex sites
npm start record https://github.com --timeout 120000 --wait-idle
```

### Timeout Guidelines

| Site Type     | Recommended Command                                   |
| ------------- | ----------------------------------------------------- |
| Simple sites  | `npm start record <url>`                              |
| Modern SPAs   | `npm start record <url> --timeout 90000`              |
| GitHub/GitLab | `npm start record <url> --timeout 90000 --wait-idle`  |
| Very slow     | `npm start record <url> --timeout 120000 --wait-idle` |

### Quick Test Sites

If GitHub is timing out, try these simpler sites first:

```bash
# Very fast, good for testing
npm start record https://example.com

# Medium complexity
npm start record https://stripe.com --timeout 90000

# Then try complex sites
npm start record https://github.com --timeout 90000 --wait-idle
```

---

## Error: "Session data not found"

### Symptoms

```
❌ Error: Session data not found
```

### Causes & Solutions

#### 1. **Session was interrupted**

**Problem:** You stopped the recording without pressing Ctrl+C cleanly (e.g., closed terminal, killed process).

**Solution:** Run a new capture session and stop it properly:

```bash
npm start record https://example.com
# Interact with page
# Press Ctrl+C to stop cleanly
```

#### 2. **No interactions were captured**

**Problem:** The page loaded but you didn't interact with any elements.

**Solution:** Make sure to actually click, hover, or interact with elements before stopping.

#### 3. **Session directory doesn't exist**

**Problem:** The path you're referencing is wrong or in a different location.

**Solution:** List available sessions:

```bash
npm start list
```

Then use the correct path shown.

#### 4. **Session is incomplete**

**Problem:** The capture is still running or wasn't finalized.

**Check if session is complete:**

```bash
ls -la ./captures/session_*/
```

You should see:

- `session.json` ✓
- `traces.jsonl` ✓
- `ai-output.json` ✓ (This is required for export)
- `README.md` ✓

If `ai-output.json` is missing, the session wasn't properly finalized.

---

## Error: "Cannot find module 'playwright'"

### Solution

```bash
npm install playwright
npx playwright install chromium
```

---

## Error: Build failed / TypeScript errors

### Solution

See [BUILD.md](./BUILD.md) for complete troubleshooting.

Quick fix:

```bash
rm -rf node_modules dist
npm install
npm run build
```

---

## Error: "Browser doesn't open"

### Solution

```bash
npx playwright install chromium
```

If that doesn't work:

```bash
npx playwright install --force chromium
```

---

## Error: "Permission denied"

### Solution

```bash
chmod +x setup.sh
chmod +x verify-setup.sh
```

Or run with proper permissions:

```bash
sudo npm install -g
```

---

## Error: "No animations captured"

### Possible Causes

1. **Animation too fast** - Some animations complete in <50ms
2. **Canvas/WebGL** - Not supported, tool captures CSS/DOM only
3. **No visual changes** - Element might have JavaScript logic but no CSS changes
4. **Page not fully loaded** - Try `--wait-idle` flag

### Solutions

**Try a simple test:**

```bash
npm start record https://github.com
# Hover over the main navigation buttons
# Click on "Sign up" button
# Stop with Ctrl+C
```

**Use --wait-idle for slow pages:**

```bash
npm start record https://example.com --wait-idle
```

---

## Error: "npm start export ... -f prompt" doesn't work

### Correct Usage

**Wrong:**

```bash
npm start export ./captures/session_* -f prompt
```

**Right:**

```bash
npm start export ./captures/session_xyz -f prompt
# Use the actual session directory name, not wildcard
```

**Find the correct path:**

```bash
npm start list
# Copy the path shown
```

---

## Wildcard Issues (\*)

### Problem

Shell wildcards (`*`) may not work as expected with npm start.

### Solution

**Option 1: List sessions first**

```bash
npm start list
# Copy the exact path
npm start export ./captures/session_1234567890_abc -f prompt
```

**Option 2: Use shell expansion**

```bash
# Bash/Zsh
npm start export $(ls -d ./captures/session_* | head -1) -f prompt
```

**Option 3: Navigate to directory**

```bash
cd captures
npm start export session_1234567890_abc -f prompt
```

---

## Debugging Tips

### Check what's in your captures directory

```bash
ls -la ./captures/
```

### Check session contents

```bash
ls -la ./captures/session_*/
cat ./captures/session_*/README.md
```

### Verify ai-output.json exists

```bash
cat ./captures/session_*/ai-output.json | head -20
```

### Check for errors in traces

```bash
tail -20 ./captures/session_*/traces.jsonl
```

---

## Common Workflow Issues

### Issue: "I ran a capture but export fails"

**Steps to debug:**

1. **List sessions:**

   ```bash
   npm start list
   ```

2. **Check if session is complete** (should show ✅):

   ```
   1. ✅ session_1234567890_abc
      Date: ...
      Profiles: 3 | Traces: 15
   ```

3. **If shows ⚠️, recapture:**

   ```bash
   npm start record https://example.com
   # Interact properly
   # Press Ctrl+C cleanly
   ```

4. **Export using exact path:**
   ```bash
   npm start export ./captures/session_1234567890_abc -f prompt
   ```

### Issue: "The prompt file is empty or wrong"

**Check the format flag:**

```bash
# For AI prompt
npm start export <path> -f prompt

# For JSON data
npm start export <path> -f json

# For Markdown
npm start export <path> -f md
```

---

## Still Having Issues?

1. **Check your Node.js version:**

   ```bash
   node --version  # Should be v18+
   ```

2. **Reinstall dependencies:**

   ```bash
   rm -rf node_modules dist
   npm install
   npm run build
   ```

3. **Run verification:**

   ```bash
   chmod +x verify-setup.sh
   ./verify-setup.sh
   ```

4. **Check the logs:**
   - Look at terminal output during capture
   - Check if browser actually opened
   - Verify you saw interaction logs (👆, 🔄, etc.)

5. **Try a fresh capture:**
   ```bash
   # Clean start
   rm -rf ./captures/*
   npm start record https://github.com
   # Interact
   # Ctrl+C
   npm start list
   npm start export <exact-path-from-list> -f prompt
   ```

---

## Quick Reference

### Correct Command Order

✅ **Right way:**

```bash
# 1. Capture
npm start record https://example.com

# 2. List (get exact path)
npm start list

# 3. View
npm start view ./captures/session_1234567890_abc

# 4. Export (use exact path, not *)
npm start export ./captures/session_1234567890_abc -f prompt
```

❌ **Common mistakes:**

```bash
# Don't use wildcard with npm start
npm start export ./captures/session_* -f prompt

# Don't forget the -f flag
npm start export ./captures/session_123 prompt

# Don't use relative paths incorrectly
npm start export ../captures/session_123 -f prompt
```

---

## Getting Help

If none of these solutions work:

1. Run `npm start list` and share the output
2. Check if `ai-output.json` exists in your session
3. Share the exact command you ran
4. Share any error messages in full
5. Check [BUILD.md](./BUILD.md) for build-specific issues
