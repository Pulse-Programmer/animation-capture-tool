# Animation Capture Tool - Portfolio Frontend

A cinematic, motion-focused portfolio website showcasing the Animation Capture Tool with professional polish designed to impress technical decision-makers.

## 🎨 Design Aesthetic

**Theme**: Recording Studio / Cinema Screen
- Dark backgrounds with dramatic lighting
- Electric blue (#00d4ff) and neon green (#00ff88) accents
- Bold typography using Syne display font
- Heavy use of animations and micro-interactions
- Layered depth with shadows and blur effects

## 📁 Files

```
public/
├── index.html    - Main HTML structure
├── styles.css    - Complete styling system
├── script.js     - Interactive functionality
└── README.md     - This file
```

## 🚀 Quick Start

### Option 1: Simple HTTP Server (Recommended for Testing)

```bash
# Using Python 3
cd public
python3 -m http.server 8000

# Using Node.js
npx serve public

# Using PHP
cd public
php -S localhost:8000
```

Then open `http://localhost:8000` in your browser.

### Option 2: Direct File Access

Simply open `index.html` in your browser. Most features will work, though some may require a server.

### Option 3: Deploy to Production

Deploy the `public/` folder to any static hosting service:

**Netlify:**
```bash
# Install Netlify CLI
npm install -g netlify-cli

# Deploy
cd public
netlify deploy --prod
```

**Vercel:**
```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
cd public
vercel --prod
```

**GitHub Pages:**
1. Push the `public/` folder contents to a `gh-pages` branch
2. Enable GitHub Pages in repository settings
3. Select `gh-pages` branch as source

**Cloudflare Pages, AWS S3, Google Cloud Storage:**
- Upload the `public/` folder contents to your hosting service
- Configure as a static site
- Done!

## ✨ Features

### Interactive Sections

1. **Hero Section**
   - Animated title with gradient text
   - Floating gradient orbs with parallax
   - Terminal simulation with typing animation
   - Cursor trail effect

2. **Features Grid**
   - 6 feature cards with hover effects
   - Scroll-triggered animations
   - Icon animations

3. **Live Demos**
   - Interactive button with click feedback
   - Card hover effect demonstration
   - Modal animation example
   - Real property change displays

4. **Code Preview**
   - Tabbed interface (Trace → Prompt → Output)
   - Syntax-highlighted code blocks
   - Copy to clipboard functionality

5. **How It Works**
   - Three-step process visualization
   - Animated statistics counters
   - Sticky visual elements

6. **Tech Stack**
   - Technology showcase
   - Hover animations

## 🎯 Target Audience

Designed to impress:
- **Founders**: Clear value proposition, professional execution
- **Recruiters**: Demonstrates design and development skills
- **CTOs**: Shows technical depth and quality

## 🔧 Customization

### Change Colors

Edit CSS variables in `styles.css`:

```css
:root {
  --color-accent-primary: #00d4ff;  /* Electric blue */
  --color-accent-secondary: #00ff88; /* Neon green */
  --color-bg: #0a0a0f;              /* Dark background */
  /* ... more variables ... */
}
```

### Update Content

Edit `index.html` to:
- Change hero title and subtitle
- Update feature descriptions
- Modify code examples
- Add your GitHub links
- Update footer information

### Add Your Branding

1. Replace `⏺ AnimCapture` logo with your own
2. Update meta tags in `<head>`
3. Add favicon
4. Update social media links in footer

### Disable Animations

For users who prefer reduced motion, animations are automatically disabled based on system preferences. To manually disable:

```css
/* Add to styles.css */
* {
  animation: none !important;
  transition: none !important;
}
```

## 📱 Responsive Design

The frontend is fully responsive:
- **Desktop**: Full layout with all features (1400px max-width)
- **Tablet**: Adjusted grid layouts (768px - 1024px)
- **Mobile**: Stacked layout, simplified navigation (< 768px)

## ⚡ Performance

- **No JavaScript frameworks**: Pure vanilla JS for minimal bundle size
- **GPU-accelerated animations**: Using CSS transforms
- **Lazy loading**: Images and content load as needed
- **Intersection Observer**: Efficient scroll animations
- **Reduced motion support**: Respects user preferences

## 🧪 Testing Checklist

Before deploying:

- [ ] Test on Chrome, Firefox, Safari, Edge
- [ ] Check responsive design on mobile devices
- [ ] Verify all links work (especially GitHub links)
- [ ] Test scroll animations
- [ ] Try code copy functionality
- [ ] Open modals and ensure they close properly
- [ ] Check terminal typing animation
- [ ] Verify smooth scrolling works
- [ ] Test with reduced motion enabled
- [ ] Check console for errors

## 🐛 Known Issues / Limitations

1. **Fonts require internet**: Using Google Fonts CDN. For offline use, download and self-host fonts.
2. **Modal background blur**: `backdrop-filter` not supported in some older browsers. Fallback is solid background.
3. **Cursor trail**: Only active in hero section to avoid performance issues.

## 📝 License

This frontend is part of the Animation Capture Tool project (MIT License).

## 🤝 Contributing

To improve the frontend:

1. Edit files in `public/`
2. Test locally
3. Submit improvements
4. Document changes

## 💡 Tips for Best Results

1. **Add Real Content**: Replace placeholder GitHub links with your actual repository
2. **Add Analytics**: Insert Google Analytics or similar to track visitors
3. **Add Favicon**: Create and add `favicon.ico` for professional appearance
4. **Optimize Images**: If you add images, compress them for faster loading
5. **Add OG Tags**: Include Open Graph tags for better social media sharing
6. **Test Loading Speed**: Use Lighthouse or PageSpeed Insights to optimize
7. **Add Contact Form**: Consider adding a way for visitors to reach you

## 🎬 Demo

The frontend demonstrates its own purpose - it's built with the same attention to animation and interaction that the tool itself captures.

---

**Built with**: HTML5, CSS3, Vanilla JavaScript
**Design**: Cinematic Dark Theme
**Typography**: Syne + JetBrains Mono
**Total Size**: ~50KB (uncompressed)

Enjoy your new portfolio frontend! 🚀
