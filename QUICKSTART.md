# Quick Start Guide

Get started with Animation Capture Tool in 5 minutes!

## Installation

```bash
cd animation-capture-tool
npm install
npm run build
```

## First Capture

Let's capture a simple button animation:

### 1. Start Recording

**IMPORTANT**: When using flags with npm commands, use `npm run` with `--` separator:

```bash
# Basic recording (stops manually with Ctrl+C)
npm start record https://github.com

# With duration flag - MUST use npm run with --
npm run record -- https://github.com -d 30

# Or run the CLI directly (always works)
node dist/cli.js record https://github.com -d 30
```

The browser will open. You'll see:

```
🚀 Starting capture session: session_1234567890_abc123
📍 Target URL: https://github.com
🌐 Loading page...
✅ Page loaded. Recording interactions...
💡 Interact with the page. Press Ctrl+C to stop.
```

### 2. Interact with the Page

- Click on the "Sign up" button
- Hover over navigation items
- Click on any interactive elements

You'll see real-time output:

```
👆 [10:30:45] click on button.btn-primary
   └─ Styles changed: transform, opacity
🔄 [10:30:45] style-change (1 elements)
```

### 3. Stop Recording

Press `Ctrl+C` **once** and wait for cleanup to complete. You'll see:

```
🛑 Stopping capture session...
   Please wait while we finalize the traces...
   📝 Processing captured interactions...
   ✅ Traces saved and processed
   🔒 Closing browser...
✅ Session complete!
📁 Output: ./captures/session_1234567890_abc123
✅ Cleanup completed successfully
```

**Note**: If the session was interrupted, you can recover it using:
```bash
node recover-sessions.js
```

### 4. View Results

```bash
npm start view ./captures/session_1234567890_abc123
```

Output:

```
# Animation Capture Session

**URL**: https://github.com
**Duration**: 12.5s
**Session ID**: session_1234567890_abc123

## Statistics

- Total traces: 15
- Interactions captured: 8
- DOM mutations: 7
- Animation profiles extracted: 3

## Animation Profiles

### click-on-button
**Trigger**: click on `button.btn-primary`
**Effect**: transition
**Properties Changed**:
- `transform`: scale(1) → scale(0.95)
- `opacity`: 1 → 0.9
...
```

### 5. Use with AI

Export for AI agent:

```bash
npm run export -- captures/session_1234567890_abc123 -f prompt
```

This creates `ai-prompt.txt`:

```
You are a frontend engineer.

Given the following interaction traces from https://github.com, generate minimal JavaScript that recreates the observed animations and behaviors.
...
```

### 6. Generate Code

Copy the prompt and paste into Claude or your AI agent:

```
[Paste the ai-prompt.txt content]

Please generate vanilla JavaScript code to recreate these animations.
```

Claude will generate something like:

```javascript
// Button press animation
const buttons = document.querySelectorAll("button.btn-primary");

buttons.forEach((button) => {
  button.addEventListener("click", function (e) {
    this.style.transition = "all 150ms ease-out";
    this.style.transform = "scale(0.95)";
    this.style.opacity = "0.9";

    setTimeout(() => {
      this.style.transform = "scale(1)";
      this.style.opacity = "1";
    }, 150);
  });
});
```

## Success! 🎉

You've just:

1. ✅ Captured web animations
2. ✅ Generated structured output
3. ✅ Used AI to recreate the code

## Next Steps

### Try Different Sites

```bash
# E-commerce animations
npm start record https://stripe.com

# Dashboard interactions
npm start record https://vercel.com

# Complex animations
npm start record https://apple.com
```

### Use Different Formats

```bash
# JSON output
npm run export -- ./captures/session_xyz -f json

# Markdown documentation
npm run export -- ./captures/session_xyz -f md

# AI prompt (creates ai-prompt.txt)
npm run export -- ./captures/session_xyz -f prompt

# Custom output file
npm run export -- ./captures/session_xyz -f prompt -o my-prompt.txt
```

### Advanced Options

```bash
# Record for exactly 30 seconds
npm run record -- https://example.com -d 30

# Headless mode (no browser window)
npm run record -- https://example.com -d 30 --headless

# Custom output location
npm run record -- https://example.com -d 30 -o ./my-animations

# Combine multiple flags
npm run record -- https://example.com -d 20 --headless -o ./captures --wait-idle
```

## Common Patterns

### Capturing Modals

1. Start recording
2. Click button that opens modal
3. Wait for modal animation to complete
4. Close modal (optional)
5. Stop recording

### Capturing Hover Effects

1. Start recording
2. Hover over interactive elements
3. Move mouse slowly to capture transitions
4. Stop recording

### Capturing Form Interactions

1. Start recording
2. Focus on input field
3. Type some text
4. Submit form
5. Stop recording

## Tips for Best Results

1. **One animation at a time**: Focus on capturing specific interactions
2. **Wait for animations**: Let CSS transitions complete before stopping
3. **Clean movements**: Avoid erratic mouse movements
4. **Review before using**: Check the README.md in the output folder

## Troubleshooting

### Browser doesn't open?

Make sure Playwright is installed:

```bash
npx playwright install chromium
```

### No animations captured?

- Make sure you actually triggered an animation
- Some animations might be too subtle
- Check if the animation is CSS-based (not canvas)

### Output folder not created?

Check file permissions:

```bash
mkdir -p ./captures
```

### Session incomplete (shows ⚠️ instead of ✅)?

If a capture was interrupted before finalization completed, run the recovery script:

```bash
node recover-sessions.js
```

This will:
- Find sessions with traces.jsonl but missing output files
- Extract animation profiles from captured traces
- Generate session.json, ai-output.json, and README.md
- Make incomplete sessions fully usable

### Command flags not working?

Remember to use `npm run` with the `--` separator:

```bash
# ❌ Wrong - flags ignored
npm start record https://example.com -d 30

# ✅ Correct - flags passed properly
npm run record -- https://example.com -d 30
```

## Need Help?

- Read the full [README.md](./README.md)
- Check [examples/](./examples/) for sample outputs
- Review the troubleshooting section

---

Happy capturing! 🎬
