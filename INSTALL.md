# 🎬 Animation Capture Tool - Installation & Usage Guide

## Quick Installation

```bash
cd animation-capture-tool

# Make setup script executable
chmod +x setup.sh

# Run setup (installs dependencies and builds project)
./setup.sh

# Or manually:
npm install
npx playwright install chromium
npm run build
```

## First Use (3 Minutes)

### 1. Capture an Animation

```bash
# Start recording
npm start record https://github.com

# Or if installed globally:
capture-anim record https://github.com
```

A browser will open. You'll see:
```
🚀 Starting capture session: session_1234567890_abc
📍 Target URL: https://github.com
✅ Page loaded. Recording interactions...
💡 Interact with the page. Press Ctrl+C to stop.
```

### 2. Interact with the Page

Click on buttons, hover over elements, interact with forms — the tool captures everything.

You'll see real-time feedback:
```
👆 [10:30:45] click on button.btn-primary
   └─ Styles changed: transform, opacity
🔄 [10:30:45] style-change (1 elements)
```

### 3. Stop Recording

Press `Ctrl+C`. You'll see:
```
🛑 Stopping capture session...
💾 Traces saved and processed
✅ Session complete: ./captures/session_1234567890_abc
```

### 4. View Results

```bash
npm start view ./captures/session_1234567890_abc
```

You'll see a summary like:
```
# Animation Capture Session

**URL**: https://github.com
**Duration**: 12.5s

## Statistics
- Interactions captured: 8
- Animation profiles extracted: 3

## Animation Profiles

### click-on-button
**Trigger**: click on `button.btn-primary`
**Properties Changed**:
- `transform`: scale(1) → scale(0.95)
- `opacity`: 1 → 0.9
...
```

### 5. Use with AI

```bash
# Export AI-ready prompt
npm start export ./captures/session_1234567890_abc -f prompt
```

This creates `ai-prompt.txt` in the session folder. Copy its contents and paste into Claude or your AI agent:

**Example AI conversation:**

**You:** 
```
[Paste the ai-prompt.txt content]

Please generate vanilla JavaScript code to recreate these animations.
```

**Claude:**
```javascript
const buttons = document.querySelectorAll('button.btn-primary');

buttons.forEach(button => {
  button.addEventListener('click', function() {
    this.style.transition = 'all 150ms ease-out';
    this.style.transform = 'scale(0.95)';
    this.style.opacity = '0.9';
    
    setTimeout(() => {
      this.style.transform = 'scale(1)';
      this.style.opacity = '1';
    }, 150);
  });
});
```

Done! You now have working animation code.

## Common Use Cases

### Capture a Modal Animation

```bash
# 1. Start capture
npm start record https://example.com

# 2. Click to open modal
# 3. Wait for animation to finish
# 4. Stop with Ctrl+C
# 5. Export and use with AI
npm start export ./captures/session_* -f prompt
```

### Capture Hover Effects

```bash
# 1. Start capture
npm start record https://example.com

# 2. Hover slowly over interactive elements
# 3. Let transitions complete
# 4. Stop with Ctrl+C
```

### Batch Capture (Automated)

```bash
# Capture for exactly 30 seconds (IMPORTANT: use npm run with --)
npm run record -- https://example.com -d 30

# Headless mode (no browser window)
npm run record -- https://example.com -d 20 --headless
```

## Command Reference

### record

**IMPORTANT**: When using flags, use `npm run record --` (note the `--` separator):

```bash
npm run record -- <url> [options]

Options:
  -o, --output <dir>        Output directory (default: ./captures)
  -d, --duration <seconds>  Recording duration, 0 for manual (default: 0)
  -t, --timeout <ms>        Page load timeout (default: 30000)
  --headless               Run browser in headless mode
  --wait-idle              Wait for network idle before recording

Examples:
npm run record -- https://example.com -d 30
npm run record -- https://example.com -d 30 --headless -o ./my-captures
node dist/cli.js record https://example.com -d 30  # Alternative: direct CLI
```

### view
```bash
npm start view <session-dir>

Example:
npm start view ./captures/session_1234567890_abc
```

### export

**IMPORTANT**: When using flags, use `npm run export --`:

```bash
npm run export -- <session-dir> [options]

Options:
  -f, --format <format>     Export format: json, md, prompt (default: json)
  -o, --output <file>       Output file path

Examples:
npm run export -- ./captures/session_* -f prompt
npm run export -- ./captures/session_* -f json -o output.json
npm run export -- ./captures/session_* -f md -o summary.md
```

### list
```bash
npm start list

# Or with custom directory
node dist/cli.js list -d ./my-captures
```

## File Structure

After capturing, you get:

```
captures/
└── session_1234567890_abc/
    ├── ai-output.json     ← Feed this to AI
    ├── session.json       ← Metadata
    ├── traces.jsonl       ← Raw traces
    └── README.md          ← Human-readable summary
```

## Tips for Best Results

### ✅ Do

- Focus on one animation at a time
- Wait for animations to complete
- Use clean, deliberate interactions
- Review README.md before using with AI
- Test on simple animations first

### ❌ Don't

- Randomly click everywhere
- Capture for too long (>30 seconds usually enough)
- Interrupt animations mid-transition
- Skip reviewing the output

## Troubleshooting

### Problem: "Command not found: capture-anim"

**Solution:**
```bash
# Use npm start instead
npm start record https://example.com

# Or install globally
npm link
```

### Problem: "Playwright browser not found"

**Solution:**
```bash
npx playwright install chromium
```

### Problem: "No animations captured"

**Possible causes:**
- Animation is too fast (<50ms)
- Animation is Canvas/WebGL-based (not supported)
- You didn't actually trigger the animation

### Problem: "Too much output"

**Solution:**
- This is normal for complex sites
- Focus on the "Animation Profiles" section
- Use `export -f prompt` for cleaner AI input

### Problem: "Page won't load"

**Solution:**
```bash
# Increase timeout
npm run record -- https://example.com --timeout 60000 -d 30

# Wait for network idle
npm run record -- https://example.com --wait-idle -d 30
```

### Problem: "Duration flag not working / session doesn't stop"

**Solution:**
The `-d` flag requires using `npm run` with the `--` separator:

```bash
# ❌ Wrong - flags ignored, app runs indefinitely
npm start record https://example.com -d 30

# ✅ Correct - use npm run with --
npm run record -- https://example.com -d 30

# ✅ Alternative - run CLI directly
node dist/cli.js record https://example.com -d 30
```

You'll know the flag worked if you see: `⏱️  Recording for 30 seconds...`

### Problem: "Session incomplete (shows ⚠️)"

**Solution:**
If a capture was interrupted before finalization completed, run the recovery script:

```bash
node recover-sessions.js
```

This will:
- Find sessions with captured traces but missing output files
- Extract animation profiles from traces
- Generate session.json, ai-output.json, and README.md
- Make all incomplete sessions usable

After recovery, run `npm start list` to verify sessions show as ✅.

## Advanced Usage

### Capture Specific Duration

```bash
# Record for exactly 20 seconds (IMPORTANT: use npm run with --)
npm run record -- https://example.com -d 20
```

### Custom Output Location

```bash
# Save to specific directory
npm run record -- https://example.com -d 30 -o ./my-animations
```

### Headless Mode (CI/CD)

```bash
# No browser window
npm run record -- https://example.com -d 10 --headless
```

### Combining Options

```bash
# Headless + custom output + increased timeout
npm run record -- https://example.com -d 30 --headless -o ./captures --timeout 60000
```

## Integration with AI Agents

### Claude

1. Capture → Export prompt
2. Open Claude.ai
3. Paste prompt
4. Add: "Generate React/Vue/vanilla JS code"
5. Get working code!

### GitHub Copilot

1. Capture → Export JSON
2. In code editor, add comment:
```javascript
// Recreate animation: [paste animation profile]
```
3. Copilot suggests implementation

### Cursor/Windsurf

1. Capture → Export prompt
2. Use in composer
3. Specify framework/style
4. Get tailored code

## What's Captured

### ✅ Supported

- CSS transitions
- CSS animations  
- Class toggles
- Style mutations
- DOM additions/removals
- Transform, opacity, display
- Position, size changes
- Most visual properties

### ⚠️ Limited Support

- Very fast animations (<50ms)
- Complex JavaScript-driven animations
- Canvas/WebGL
- Video/audio animations

## Next Steps

1. ✅ Try capturing a simple button animation
2. ✅ Review the output in `README.md`
3. ✅ Export for AI and generate code
4. ✅ Try more complex animations
5. ✅ Read full documentation in `README.md`
6. ✅ Check `AI-PROMPT-TEMPLATES.md` for advanced prompts

## Support & Resources

- **Full Documentation**: [README.md](./README.md)
- **Quick Start**: [QUICKSTART.md](./QUICKSTART.md)
- **AI Templates**: [AI-PROMPT-TEMPLATES.md](./AI-PROMPT-TEMPLATES.md)
- **Examples**: [examples/button-click.md](./examples/button-click.md)
- **Architecture**: [PROJECT-SUMMARY.md](./PROJECT-SUMMARY.md)

## Success Checklist

- [ ] Installed dependencies
- [ ] Ran first capture
- [ ] Viewed output
- [ ] Exported for AI
- [ ] Generated working code
- [ ] Integrated into project

---

**Happy capturing! 🎬**

Need help? Check the troubleshooting section or review the full documentation.
