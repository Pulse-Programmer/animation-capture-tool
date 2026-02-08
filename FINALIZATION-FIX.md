# IMPORTANT: Finalization Fix

## The Problem You're Experiencing

You're seeing interactions being captured (👆, 🔄, 🎯) but when you press Ctrl+C, the session doesn't finalize properly - no `ai-output.json` is created.

## Root Cause

The process exits before the async finalization completes. This is a Node.js signal handling issue.

## The Fix

I've updated the code to:
1. Properly handle async cleanup
2. Add a delay to ensure file writes complete
3. Better error handling

## What You Need To Do

### Step 1: Rebuild
```bash
cd animation-capture-tool
npm run build
```

### Step 2: Test Again
```bash
npm start record http://localhost:8000/test-page.html
```

### Step 3: Interact
- Click buttons
- Hover over elements
- You should see: 👆, 🔄, 🎯

### Step 4: Stop Properly
- Press Ctrl+C **ONCE**
- Wait for these messages:
  ```
  🛑 Stopping capture session...
     Please wait while we finalize the traces...
     📝 Processing captured interactions...
     ✅ Traces saved and processed
     🔒 Closing browser...
  ✅ Session complete!
  ```

### Step 5: Verify
```bash
npm start list
```

Should show:
```
1. ✅ session_xyz
   Profiles: 2 | Traces: 8
```

## If It Still Doesn't Work

### Alternative Method: Use Duration Flag

Instead of Ctrl+C, use automatic timeout:

```bash
# Capture for 15 seconds then auto-stop
npm start record http://localhost:8000/test-page.html -d 15
```

This ensures clean shutdown because the process finishes naturally.

**Workflow:**
1. Run command with `-d 15`
2. Page opens
3. You have 15 seconds to interact
4. Automatically stops and saves
5. Done!

### Another Alternative: Check Files Manually

Even if the stop message doesn't show properly, the files might still be there:

```bash
# List sessions
ls -la ./captures/

# Check the latest session
ls -la ./captures/session_*/

# If you see ai-output.json, it worked!
# View it
npm start view ./captures/session_LATEST/
```

## Debugging the Finalization

Check if files are being created:

```bash
# Start capture
npm start record http://localhost:8000/test-page.html &
CAPTURE_PID=$!

# In another terminal, watch the files
watch -n 1 "ls -lah ./captures/session_*/"

# Interact with the page

# Stop the capture
kill -INT $CAPTURE_PID

# Watch the files directory - you should see:
# 1. traces.jsonl appears immediately
# 2. session.json appears after stop
# 3. ai-output.json appears during finalization
# 4. README.md appears last
```

## Known Issue: Terminal Handling

Some terminals don't properly wait for async handlers when Ctrl+C is pressed. 

**Solutions:**

### Solution 1: Use Duration Flag (Recommended)
```bash
npm start record <url> -d 20
# Interact for 20 seconds, then it auto-stops cleanly
```

### Solution 2: Use Alternative Stop Method
Instead of Ctrl+C:
```bash
# In terminal 1: Start capture
npm start record http://localhost:8000/test-page.html

# Note the session ID from the output

# In terminal 2: Send proper shutdown signal
kill -INT $(pgrep -f "node dist/cli.js record")

# This sends SIGINT properly and waits for cleanup
```

### Solution 3: Manual Finalization
If the session has traces but no ai-output.json, you can manually finalize:

```bash
# Create a finalize script
cat > finalize-session.js << 'EOF'
const fs = require('fs');
const path = require('path');

const sessionDir = process.argv[2];
if (!sessionDir) {
  console.log('Usage: node finalize-session.js <session-dir>');
  process.exit(1);
}

const tracesFile = path.join(sessionDir, 'traces.jsonl');
if (!fs.existsSync(tracesFile)) {
  console.log('No traces.jsonl found');
  process.exit(1);
}

const traces = fs.readFileSync(tracesFile, 'utf-8')
  .split('\n')
  .filter(line => line.trim())
  .map(line => JSON.parse(line));

const interactions = traces.filter(t => t.type === 'interaction');

const output = {
  session: {
    url: interactions[0]?.url || 'unknown',
    duration: 0
  },
  animationProfiles: [],
  interactionTraces: interactions.slice(0, 50),
  metadata: {
    totalInteractions: interactions.length,
    totalMutations: traces.filter(t => t.type === 'mutation').length,
    capturedAt: new Date().toISOString()
  }
};

fs.writeFileSync(
  path.join(sessionDir, 'ai-output.json'),
  JSON.stringify(output, null, 2)
);

console.log('✅ Finalized:', sessionDir);
EOF

# Use it:
node finalize-session.js ./captures/session_xyz
```

## Test Right Now

```bash
# Method 1: Use duration (most reliable)
npm run build
npm start record http://localhost:8000/test-page.html -d 10

# Click around for 10 seconds
# It will auto-stop and save properly

# Then check:
npm start list
```

## Expected Behavior After Fix

**Start:**
```
🚀 Starting capture session: session_xyz
📍 Target URL: http://localhost:8000/test-page.html
🌐 Loading page...
✅ Page loaded. Recording interactions...
```

**During:**
```
👆 [time] click on button
🔄 [time] content-update
```

**Stop (Ctrl+C):**
```
🛑 Stopping capture session...
   Please wait while we finalize the traces...
   📝 Processing captured interactions...
   ✅ Traces saved and processed
   🔒 Closing browser...

✅ Session complete!
📁 Output: ./captures/session_xyz
```

**Verify:**
```bash
$ npm start list

📊 Found 1 capture session(s):

1. ✅ session_xyz               ← Green check
   Date: ...
   URL: http://localhost:8000/test-page.html
   Profiles: 2 | Traces: 8      ← Has data
```

This is success! If you see this, everything worked.
