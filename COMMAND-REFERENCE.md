# Quick Command Reference

## Common Commands

### Record with Default Settings (60s timeout)
```bash
npm start record https://example.com
```

### Record with Longer Timeout (for slow sites)
```bash
npm start record https://example.com --timeout 90000
```

### Record with Network Wait (most reliable)
```bash
npm start record https://example.com --wait-idle
```

### Record for Specific Duration
```bash
npm start record https://example.com -d 30
# Automatically stops after 30 seconds
```

### Record in Headless Mode
```bash
npm start record https://example.com --headless
```

### List All Sessions
```bash
npm start list
```

### View Session
```bash
npm start view ./captures/session_xyz
```

### Export for AI
```bash
npm start export ./captures/session_xyz -f prompt
```

## Recommended Workflows

### For Fast Sites (Like Simple Landing Pages)
```bash
npm start record https://example.com
```

### For Slow Sites (Like GitHub, Complex Apps)
```bash
npm start record https://github.com --timeout 90000 --wait-idle
```

### For Very Slow Sites or Flaky Networks
```bash
npm start record https://example.com --timeout 120000 --wait-idle
```

### Quick Test Capture (Auto-stop after 20 seconds)
```bash
npm start record https://example.com -d 20
```

### Headless CI/CD Capture
```bash
npm start record https://example.com --headless --timeout 90000 -d 30
```

## Timeout Guidelines

| Site Type | Recommended Timeout |
|-----------|---------------------|
| Simple HTML | 30000 (30s) - default |
| Modern SPA | 60000 (60s) |
| GitHub/GitLab | 90000 (90s) |
| Very complex | 120000 (120s) |
| Slow network | 180000 (180s) |

## Flag Reference

### record command
```
npm start record <url> [options]

Required:
  <url>                    Website URL (must start with http:// or https://)

Options:
  -o, --output <dir>       Output directory (default: ./captures)
  -t, --timeout <ms>       Page load timeout in milliseconds (default: 60000)
  -d, --duration <sec>     Auto-stop after N seconds, 0=manual (default: 0)
  --headless              Run without visible browser window
  --wait-idle             Wait for network idle before starting capture
```

### list command
```
npm start list [options]

Options:
  -d, --directory <dir>    Captures directory (default: ./captures)
```

### view command
```
npm start view <session-dir>

Required:
  <session-dir>           Path to session directory
```

### export command
```
npm start export <session-dir> [options]

Required:
  <session-dir>           Path to session directory

Options:
  -f, --format <type>     Export format: json, md, prompt (default: json)
  -o, --output <file>     Custom output file path
```

## Examples by Use Case

### Learning How Animations Work
```bash
# Capture a site with nice animations
npm start record https://stripe.com --timeout 90000

# View what was captured
npm start list
npm start view ./captures/session_xyz

# Study the animation profiles in the README
```

### Building Animation Library
```bash
# Capture multiple sites
npm start record https://site1.com --timeout 90000
npm start record https://site2.com --timeout 90000
npm start record https://site3.com --timeout 90000

# Export all as JSON for processing
npm start list
for session in ./captures/session_*; do
  npm start export "$session" -f json -o "$session/export.json"
done
```

### Quick AI Code Generation
```bash
# Capture
npm start record https://example.com --timeout 90000

# List and get path
npm start list

# Export prompt
npm start export ./captures/session_xyz -f prompt

# The prompt file is now at:
# ./captures/session_xyz/ai-prompt.txt
# Copy it and paste to Claude/GPT
```

### CI/CD Animation Regression Testing
```bash
# Headless capture with auto-stop
npm start record https://staging.myapp.com \
  --headless \
  --timeout 90000 \
  --wait-idle \
  -d 30

# Export as JSON for comparison
npm start export ./captures/session_latest -f json
```

## Troubleshooting Quick Fixes

### Timeout Error
```bash
# Increase timeout
npm start record <url> --timeout 120000

# Or use network wait
npm start record <url> --wait-idle
```

### Page Loads But No Interactions Captured
```bash
# Make sure you're actually clicking/hovering
# The terminal should show emoji indicators:
# 👆 = click
# 👉 = hover
# ⌨️ = input
# 🔄 = mutation
```

### Wildcard Not Working
```bash
# Don't use *
# Instead, use npm start list first
npm start list
# Then copy exact path
```

### Can't Find Session
```bash
npm start list
# Shows all sessions with paths
```

## Pro Tips

1. **Always use `--timeout 90000` for real websites** (GitHub, apps, etc.)
2. **Use `--wait-idle` if site has lazy loading**
3. **Use `npm start list` before export** to get exact paths
4. **Test on simple sites first** (like https://example.com)
5. **Watch the terminal** for interaction indicators
6. **Let animations complete** before pressing Ctrl+C
7. **Use `-d` for automated captures** to avoid forgetting to stop

## Common Patterns

### Pattern: Capture Button Hover
```bash
npm start record https://site.com --timeout 90000
# Hover over buttons slowly
# Ctrl+C
```

### Pattern: Capture Modal Animation
```bash
npm start record https://site.com --timeout 90000
# Click to open modal
# Wait 2 seconds
# Close modal (optional)
# Ctrl+C
```

### Pattern: Capture Form Interactions
```bash
npm start record https://site.com --timeout 90000
# Focus on input
# Type some text
# Submit form
# Ctrl+C
```

### Pattern: Batch Capture
```bash
#!/bin/bash
sites=(
  "https://site1.com"
  "https://site2.com"
  "https://site3.com"
)

for site in "${sites[@]}"; do
  npm start record "$site" --headless --timeout 90000 -d 20
done
```

---

For more details, see:
- [START-HERE.md](./START-HERE.md) - Getting started
- [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) - Error solutions
- [README.md](./README.md) - Full documentation
