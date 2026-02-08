# 🎬 Start Here - Animation Capture Tool

## What Is This?

A tool that **captures animations from any website** and generates **AI-ready structured data** so you can recreate those animations in your own projects.

**In 3 steps:**
1. Capture → Run tool on a website
2. Export → Get structured animation data
3. Generate → Feed to AI → Get working code

## ⚡ Quick Start (5 Minutes)

### Step 1: Install

```bash
cd animation-capture-tool
chmod +x setup.sh
./setup.sh
```

Or manually:
```bash
npm install
npx playwright install chromium
npm run build
```

### Step 2: Capture Your First Animation

```bash
npm start record https://github.com
```

A browser opens. Click on buttons, hover over elements. Press `Ctrl+C` when done.

### Step 3: View What Was Captured

```bash
npm start view ./captures/session_*
```

You'll see a summary with animation profiles like:

```
Animation Profile: click-on-button

Trigger: click on button.btn-primary
Properties Changed:
- transform: scale(1) → scale(0.95)
- opacity: 1 → 0.8
Timing: 150ms ease-out
```

### Step 4: Export for AI

```bash
npm start export ./captures/session_* -f prompt
```

This creates an AI-ready prompt file.

### Step 5: Generate Code with AI

Copy the prompt, paste into Claude/ChatGPT:

**You:**
```
[Paste the generated prompt]

Please generate vanilla JavaScript to recreate this animation.
```

**AI Response:**
```javascript
const button = document.querySelector('button.btn-primary');
button.addEventListener('click', () => {
  button.style.transition = 'all 150ms ease-out';
  button.style.transform = 'scale(0.95)';
  button.style.opacity = '0.8';
  
  setTimeout(() => {
    button.style.transform = 'scale(1)';
    button.style.opacity = '1';
  }, 150);
});
```

**Done!** You now have working animation code.

## 📚 Documentation Guide

### 🆕 New Users
1. **START HERE** (you are here)
2. [INSTALL.md](./INSTALL.md) - Installation & first use
3. [QUICKSTART.md](./QUICKSTART.md) - 5-minute guide

### 📖 Reference
4. [README.md](./README.md) - Complete documentation
5. [AI-PROMPT-TEMPLATES.md](./AI-PROMPT-TEMPLATES.md) - Optimized AI prompts
6. [BUILD.md](./BUILD.md) - Build troubleshooting

### 🏗️ Technical
7. [PROJECT-SUMMARY.md](./PROJECT-SUMMARY.md) - Architecture overview
8. [examples/](./examples/) - Sample outputs

## 🎯 What Can You Capture?

✅ Button clicks & hover effects  
✅ Modal animations  
✅ Dropdown menus  
✅ Form interactions  
✅ Fade/scale/rotate transitions  
✅ CSS animations & transitions  

⚠️ Limited: Canvas, WebGL, complex JS animations

## 🤔 Common Questions

### "Do I need to know how to code?"

No! The tool captures animations visually. You just:
1. Browse to a website
2. Interact with elements
3. Copy the output to an AI

The AI generates the code for you.

### "What websites can I capture from?"

Any website! But:
- ✅ Works best on modern sites with CSS animations
- ⚠️ May have issues with sites requiring login
- ⚠️ Canvas/game animations won't work well

### "What do I do with the captured data?"

Option 1: Feed to AI (Claude, GPT, Copilot) → Get code  
Option 2: Study the animation profiles manually  
Option 3: Build an animation library for your team  

### "Which AI should I use?"

- **Claude** (recommended) - Great at understanding structured data
- **ChatGPT** - Also works well
- **GitHub Copilot** - Good for in-editor suggestions
- **Cursor/Windsurf** - Perfect for project integration

### "How do I know it worked?"

After running `record`, you should see:
```
✅ Page loaded. Recording interactions...
👆 [time] click on button.submit
   └─ Styles changed: transform, opacity
```

If you see this, it's working!

## 🚨 Troubleshooting

### "Build failed"

Check [BUILD.md](./BUILD.md) for detailed help. Quick fix:

```bash
rm -rf node_modules dist
npm install
npm run build
```

### "No browser opens"

Run:
```bash
npx playwright install chromium
```

### "No animations captured"

Possible issues:
- Animation too fast (<50ms)
- Canvas/WebGL animation (not supported)
- You didn't actually trigger the animation

Try a simple button hover first.

### "AI generates wrong code"

- Check the prompt has complete data
- Try [AI-PROMPT-TEMPLATES.md](./AI-PROMPT-TEMPLATES.md) for better prompts
- Add more context about your project
- Try different AI model

## 🎓 Learning Path

**Day 1:** Get it running
- Follow this guide
- Capture your first animation
- Generate code with AI

**Day 2:** Explore features
- Try different websites
- Experiment with export formats
- Read the full documentation

**Day 3:** Advanced usage
- Use custom AI prompts
- Build animation library
- Integrate into your workflow

## 📦 What's Included?

```
animation-capture-tool/
├── src/              # TypeScript source code
├── examples/         # Sample outputs
├── START-HERE.md     # This file
├── INSTALL.md        # Installation guide
├── QUICKSTART.md     # 5-minute guide
├── README.md         # Full documentation
├── BUILD.md          # Build help
├── setup.sh          # Automated setup
└── package.json
```

## 🎯 Success Checklist

First time using the tool? Check these off:

- [ ] Installed dependencies (`npm install`)
- [ ] Built the project (`npm run build`)
- [ ] Ran first capture (`npm start record https://example.com`)
- [ ] Saw real-time output in terminal
- [ ] Stopped recording (Ctrl+C)
- [ ] Viewed results (`npm start view ./captures/session_*`)
- [ ] Exported for AI (`npm start export ... -f prompt`)
- [ ] Fed to AI agent
- [ ] Got working animation code
- [ ] Tested code in your project

## 🚀 Next Steps

Completed the quick start? Now:

1. **Read [README.md](./README.md)** for full documentation
2. **Try [AI-PROMPT-TEMPLATES.md](./AI-PROMPT-TEMPLATES.md)** for better AI results
3. **Capture real animations** from sites you admire
4. **Build your animation library** for reuse

## 💡 Pro Tips

1. **Focus on one animation** - Don't capture everything at once
2. **Wait for completion** - Let animations finish before stopping
3. **Review before AI** - Check the README.md in session folder
4. **Experiment with prompts** - Better prompts = better code
5. **Start simple** - Try button hover before complex modals

## 🆘 Need Help?

1. Check [BUILD.md](./BUILD.md) for build issues
2. Read [INSTALL.md](./INSTALL.md) for detailed usage
3. Review [examples/](./examples/) for expected outputs
4. Check the troubleshooting sections in docs

## ✨ What Makes This Tool Special?

Unlike screen recorders or browser devtools:
- ✅ Captures **structure**, not just visuals
- ✅ **Filters noise** (framework artifacts, etc.)
- ✅ Extracts **timing and properties** automatically
- ✅ Generates **AI-ready output**
- ✅ Works on **any website**
- ✅ **Free and open source**

---

**Ready? Start with installation:**

```bash
cd animation-capture-tool
./setup.sh
```

Then capture your first animation:

```bash
npm start record https://github.com
```

**Happy capturing! 🎬**
