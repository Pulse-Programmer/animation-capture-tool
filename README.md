# Animation Capture Tool

A powerful tool that captures web interactions and animations, generating structured data that AI coding agents can use to recreate animations in your projects.

## 🎯 What It Does

This tool:

1. **Captures** user interactions (clicks, hovers, inputs) on any website
2. **Records** DOM changes, CSS transitions, and style mutations
3. **Extracts** animation profiles with timing, easing, and property changes
4. **Generates** AI-ready structured output that can be fed to coding agents

## 🚀 Installation

```bash
# Clone or download the tool
cd animation-capture-tool

# Install dependencies
npm install

# Install Playwright browser
npx playwright install chromium

# Build the tool
npm run build

# Make CLI available globally (optional)
npm link
```

**Having build issues?** See [BUILD.md](./BUILD.md) for detailed troubleshooting.

**Quick setup:** Run `./setup.sh` for automated installation.

## 📖 Usage

### Basic Recording

Record interactions on any website:

```bash
# Method 1: Using npm scripts (RECOMMENDED when not globally installed)
npm run record -- https://example.com -d 30
npm run record -- https://example.com -d 30 --headless -o ./my-captures

# Method 2: Direct CLI
node dist/cli.js record https://example.com -d 30

# Method 3: Global command (if npm linked)
capture-anim record https://example.com -d 30

# Manual stop with Ctrl+C (no duration flag)
npm start record https://example.com
```

**📌 Important**: When using npm commands with flags, use `npm run <command> --` (note the `--` separator). The `--` tells npm to pass all following arguments to the script instead of treating them as npm flags.

### Command Options

**`record` command:**

- `<url>` - Target website URL (required)
- `-o, --output <dir>` - Output directory (default: `./captures`)
- `-d, --duration <seconds>` - Recording duration, 0 for manual stop (default: 0)
- `-t, --timeout <ms>` - Page load timeout (default: 30000)
- `--headless` - Run browser in headless mode
- `--wait-idle` - Wait for network idle before recording

### Viewing Captures

View captured session summary:

```bash
# Using npm
npm start view ./captures/session_xyz

# Or directly
node dist/cli.js view ./captures/session_xyz
```

List all sessions:

```bash
# Using npm
npm start list

# Or directly
node dist/cli.js list
```

This shows all captured sessions with their status (✅ complete or ⚠️ incomplete), date, and statistics.

### Exporting Data

Export captured data in different formats:

```bash
# Export as JSON
npm run export -- ./captures/session_xyz -f json -o output.json

# Export as Markdown
npm run export -- ./captures/session_xyz -f md -o output.md

# Export as AI prompt (creates ai-prompt.txt by default)
npm run export -- ./captures/session_xyz -f prompt

# Custom output file
npm run export -- ./captures/session_xyz -f prompt -o my-prompt.txt
```

## 📁 Output Structure

Each capture session creates a directory with:

```
captures/
└── session_1234567890_abc123/
    ├── session.json          # Session metadata
    ├── traces.jsonl          # Raw interaction traces (JSONL format)
    ├── ai-output.json        # AI-ready structured output
    └── README.md             # Human-readable summary
```

### Key Files

**`ai-output.json`** - The gold standard for AI agents:

```json
{
  "session": {
    "url": "https://example.com",
    "duration": 15000
  },
  "animationProfiles": [
    {
      "name": "click-on-button",
      "trigger": {
        "event": "click",
        "selector": "button.submit"
      },
      "effect": {
        "type": "transition",
        "target": "button.submit",
        "properties": {
          "opacity": { "from": "1", "to": "0.5" },
          "transform": { "from": "scale(1)", "to": "scale(0.95)" }
        },
        "timing": {
          "duration": "200ms",
          "easing": "ease-out"
        }
      }
    }
  ],
  "interactionTraces": [...]
}
```

## 🤖 Using with AI Coding Agents

### Method 1: Direct Prompt with Output

1. Capture animations:

```bash
capture-anim record https://example.com
```

2. Export AI prompt:

```bash
capture-anim export ./captures/session_xyz -f prompt -o prompt.txt
```

3. Feed to AI agent (like Claude):

```bash
# If using Claude Code or similar
cat prompt.txt | your-ai-agent
```

### Method 2: Custom Prompt Template

Use this template with `ai-output.json`:

```
You are a frontend engineer.

Given static HTML and these interaction traces, generate minimal JavaScript that recreates the observed behavior.

Do not invent features.
Prefer event listeners and class toggles.
Use vanilla JS unless stated otherwise.

[Paste contents of ai-output.json here]

Generate complete, working code including:
1. HTML structure (if needed)
2. CSS classes/transitions
3. JavaScript event handlers
4. Ensure timing matches the captured animation
```

### Method 3: React/Vue/Svelte Framework

Modify the prompt for your framework:

```
You are a React developer.

Given these animation profiles, create React components with:
- Proper hooks (useState, useEffect)
- CSS modules or styled-components
- Event handlers that trigger animations
- TypeScript types (if applicable)

[Paste ai-output.json content]
```

## 🎬 Example Workflow

### Capturing a Modal Animation

1. **Start Recording**:

```bash
capture-anim record https://example.com/with-modal
```

2. **Interact with Page**:
   - Click button that opens modal
   - Wait for animation to complete
   - Close modal
   - Press `Ctrl+C` to stop

3. **View Results**:

```bash
capture-anim view ./captures/session_xyz
```

4. **Export for AI**:

```bash
capture-anim export ./captures/session_xyz -f prompt
```

5. **Generate Code**:
   - Copy the generated prompt
   - Paste into Claude or your preferred AI agent
   - Get working animation code!

### Example Output

The tool might capture something like:

```
Animation Profile: click-on-open-modal

Trigger: click on button[data-action="open-modal"]
Effect: transition
Properties:
  - opacity: 0 → 1
  - transform: scale(0.9) → scale(1)
  - display: none → flex
Timing:
  - Duration: 300ms
  - Easing: cubic-bezier(0.4, 0, 0.2, 1)
```

Which an AI can turn into:

```javascript
const modal = document.querySelector(".modal");
const openBtn = document.querySelector('button[data-action="open-modal"]');

openBtn.addEventListener("click", () => {
  modal.style.display = "flex";
  modal.style.opacity = "0";
  modal.style.transform = "scale(0.9)";

  requestAnimationFrame(() => {
    modal.style.transition = "all 300ms cubic-bezier(0.4, 0, 0.2, 1)";
    modal.style.opacity = "1";
    modal.style.transform = "scale(1)";
  });
});
```

## 🎨 What Can Be Captured

### ✅ Supported Interactions

- **Click events** - Buttons, links, interactive elements
- **Hover effects** - Style changes on mouseover
- **Input events** - Form field interactions
- **Focus/Blur** - Input focus animations
- **Class toggles** - CSS class additions/removals
- **Style mutations** - Inline style changes
- **DOM updates** - Element additions/removals
- **CSS transitions** - Property changes with timing
- **CSS animations** - Named animations with keyframes

### ✅ Captured Properties

- `opacity`, `transform`, `display`, `visibility`
- `position`, `top`, `left`, `right`, `bottom`
- `width`, `height`, `z-index`
- `filter`, `backdrop-filter`, `clip-path`
- `transition-*` and `animation-*` properties
- Class changes and attribute updates

### ⚠️ Limitations

- **Cannot capture**: JavaScript-driven canvas animations, WebGL, complex timing functions outside CSS
- **Best for**: CSS transitions, class-based animations, DOM manipulations
- **Framework noise**: Automatically filters out React/Vue/Angular artifacts

## 🔧 Advanced Usage

### Filtering Noise

The tool automatically filters:

- Framework-generated attributes (React IDs, Vue IDs, etc.)
- Hash-based CSS classes
- Transient state changes
- Non-visual mutations

### Customizing Selectors

The tool uses a **stable selector engine** that prefers:

1. Semantic attributes (`id`, `data-testid`, `aria-label`)
2. Meaningful classes (not auto-generated)
3. Structural paths (as fallback)

This ensures selectors work even if the framework re-renders.

### Performance Tips

- **Short sessions**: Capture only the specific interaction you need
- **Headless mode**: Use `--headless` for faster, resource-efficient captures
- **Targeted URLs**: Navigate directly to the page with the animation

## 🐛 Troubleshooting

### "Page failed to load"

- Check internet connection
- Increase timeout: `--timeout 60000`
- Try with `--wait-idle` flag

### "No animations captured"

- Ensure you actually triggered the animation
- Some animations might be too fast (< 50ms)
- Check if animation is CSS-based (not canvas/WebGL)

### "Selector not working in generated code"

- The page structure might have changed
- Try capturing again on the latest version
- Manually adjust selector in generated code

### "Too much noise in output"

- This is normal for complex apps
- Focus on the `animationProfiles` in `ai-output.json`
- Use the `export -f prompt` command for cleaner AI input

### Session shows as incomplete (⚠️ instead of ✅)

If a capture session was interrupted before finalization completed:

```bash
# Run the recovery script
node recover-sessions.js
```

This will:

- Find sessions with traces.jsonl but missing output files
- Extract animation profiles from captured traces
- Generate session.json, ai-output.json, and README.md files
- Make incomplete sessions fully usable

### Duration flag not working

Make sure you're using the correct npm syntax:

```bash
# ❌ Wrong - flags are ignored
npm start record https://example.com -d 30

# ✅ Correct - use npm run with -- separator
npm run record -- https://example.com -d 30

# ✅ Also correct - run CLI directly
node dist/cli.js record https://example.com -d 30
```

### Session doesn't stop after duration

- Ensure you used `npm run record --` (with `--`) not `npm start record`
- Check that you specified the duration flag: `-d <seconds>`
- The app will show "⏱️ Recording for X seconds..." if the flag was recognized

## 📊 Understanding the Output

### Trace Types

1. **interaction** - User action (click, hover, etc.)
2. **mutation** - DOM change detected
3. **style** - CSS property change
4. **network** - API call triggered by interaction

### Animation Profiles

Profiles are **extracted patterns** from traces:

- Group related style changes
- Identify trigger → effect relationships
- Extract timing information
- Perfect for AI reconstruction

### Intent Detection

The tool tries to understand **why** changes happened:

- `style-change` - Pure CSS update
- `content-update` - Text/innerHTML change
- `dom-restructure` - Elements added/removed
- `attribute-change` - Attribute modification

## 🤝 Integration Examples

### With Claude Code

```bash
# Capture animation
capture-anim record https://example.com

# Export prompt
capture-anim export ./captures/session_xyz -f prompt -o prompt.txt

# Use with Claude Code
claude-code --prompt "$(cat prompt.txt)" --file src/animations.js
```

### With GitHub Copilot

1. Copy `ai-output.json` content
2. In your code editor, add comment:

```javascript
// Recreate this animation:
// [paste animation profile]
```

3. Let Copilot generate the code

### In CI/CD

```yaml
# .github/workflows/capture-animations.yml
- name: Capture Animations
  run: |
    npx capture-anim record $STAGING_URL --headless -d 10
    npx capture-anim export ./captures/session_* -f json -o animations.json
```

## 📝 Best Practices

1. **Be specific**: Capture one animation at a time
2. **Clean interactions**: Avoid random clicking/hovering
3. **Wait for completion**: Let animations finish before stopping
4. **Review output**: Check `README.md` before using with AI
5. **Iterate**: If AI output isn't perfect, refine the prompt
6. **Version control**: Save capture sessions for reference

## 🔐 Privacy & Security

- Tool runs locally on your machine
- No data sent to external servers
- Captures only interaction traces, not sensitive data
- Always review output before sharing

## 📚 Example Use Cases

1. **Design → Dev Handoff**: Capture designer prototypes, generate code
2. **Competitor Analysis**: Study and recreate competitor animations
3. **Animation Library**: Build reusable animation templates
4. **Documentation**: Record how interactions work
5. **Testing**: Validate animation timing and behavior
6. **Learning**: Understand how complex animations work

## 🆘 Support

For issues, suggestions, or questions:

- Check the troubleshooting section
- Review example outputs in `./examples`
- Open an issue on GitHub

## 📄 License

MIT License - See LICENSE file for details

---

**Made with ❤️ for frontend developers who want to learn from and recreate great animations.**
