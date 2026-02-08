/**
 * Animation Capture Tool - Frontend JavaScript
 * Handles all interactions, animations, and dynamic behaviors
 */

// ==========================================
// Scroll-Triggered Animations
// ==========================================

const observerOptions = {
  threshold: 0.1,
  rootMargin: '0px 0px -100px 0px'
};

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');

      // Apply staggered delays for feature cards
      if (entry.target.classList.contains('feature-card')) {
        const delay = entry.target.dataset.delay || 0;
        entry.target.style.animationDelay = `${delay}ms`;
      }
    }
  });
}, observerOptions);

// Observe all animated elements
const animatedElements = document.querySelectorAll(
  '.feature-card, .demo-card, .code-showcase, .step, .tech-item'
);

animatedElements.forEach(el => observer.observe(el));

// ==========================================
// Code Tabs Functionality
// ==========================================

const codeTabs = document.querySelectorAll('.code-tab');
const codePanels = document.querySelectorAll('.code-panel');

codeTabs.forEach(tab => {
  tab.addEventListener('click', () => {
    const targetLang = tab.dataset.lang;

    // Update active states
    codeTabs.forEach(t => t.classList.remove('active'));
    tab.classList.add('active');

    codePanels.forEach(panel => {
      panel.classList.remove('active');
      if (panel.dataset.panel === targetLang) {
        panel.classList.add('active');
      }
    });
  });
});

// ==========================================
// Copy to Clipboard
// ==========================================

const copyButtons = document.querySelectorAll('.copy-btn');

copyButtons.forEach(btn => {
  btn.addEventListener('click', async () => {
    const codePanel = btn.closest('.code-panel');
    const codeContent = codePanel.querySelector('code').textContent;

    try {
      await navigator.clipboard.writeText(codeContent);

      // Visual feedback
      const originalText = btn.textContent;
      btn.textContent = 'Copied!';
      btn.style.background = 'rgba(0, 255, 136, 0.2)';
      btn.style.borderColor = 'rgba(0, 255, 136, 0.3)';

      setTimeout(() => {
        btn.textContent = originalText;
        btn.style.background = '';
        btn.style.borderColor = '';
      }, 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
      btn.textContent = 'Failed';
      setTimeout(() => {
        btn.textContent = 'Copy';
      }, 2000);
    }
  });
});

// ==========================================
// Modal Demo Interactions
// ==========================================

const modalTriggers = document.querySelectorAll('.modal-trigger');
const modalOverlays = document.querySelectorAll('.modal-overlay');
const modalCloseButtons = document.querySelectorAll('.modal-close');

modalTriggers.forEach(trigger => {
  trigger.addEventListener('click', () => {
    const overlay = trigger.nextElementSibling;
    if (overlay && overlay.classList.contains('modal-overlay')) {
      overlay.classList.add('active');
      document.body.style.overflow = 'hidden';
    }
  });
});

modalCloseButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    const overlay = btn.closest('.modal-overlay');
    if (overlay) {
      overlay.classList.remove('active');
      document.body.style.overflow = '';
    }
  });
});

// Close modal on overlay click
modalOverlays.forEach(overlay => {
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) {
      overlay.classList.remove('active');
      document.body.style.overflow = '';
    }
  });
});

// Close modal on Escape key
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    modalOverlays.forEach(overlay => {
      overlay.classList.remove('active');
      document.body.style.overflow = '';
    });
  }
});

// ==========================================
// Smooth Scroll for Navigation
// ==========================================

document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    const href = this.getAttribute('href');

    // Skip if it's just "#" or empty
    if (!href || href === '#') return;

    e.preventDefault();
    const targetId = href.substring(1);
    const targetElement = document.getElementById(targetId);

    if (targetElement) {
      const navHeight = document.querySelector('.nav').offsetHeight;
      const targetPosition = targetElement.offsetTop - navHeight - 20;

      window.scrollTo({
        top: targetPosition,
        behavior: 'smooth'
      });
    }
  });
});

// ==========================================
// Navbar Scroll Effect
// ==========================================

let lastScroll = 0;
const nav = document.querySelector('.nav');

window.addEventListener('scroll', () => {
  const currentScroll = window.pageYOffset;

  // Add shadow on scroll
  if (currentScroll > 50) {
    nav.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.5)';
  } else {
    nav.style.boxShadow = 'none';
  }

  lastScroll = currentScroll;
});

// ==========================================
// Terminal Command Animation
// ==========================================

function typeCommand(element, text, delay = 0) {
  const command = element.querySelector('.command');
  if (!command) return;

  command.textContent = '';
  let charIndex = 0;

  setTimeout(() => {
    const typeInterval = setInterval(() => {
      if (charIndex < text.length) {
        command.textContent += text[charIndex];
        charIndex++;
      } else {
        clearInterval(typeInterval);
      }
    }, 50);
  }, delay);
}

// Trigger typing animation when CTA terminal is visible
const ctaTerminal = document.querySelector('.cta-terminal');
if (ctaTerminal) {
  const ctaObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const lines = ctaTerminal.querySelectorAll('.terminal-line');
        if (lines[0]) {
          typeCommand(lines[0], 'npm install -g animation-capture-tool', 500);
        }
        if (lines[1]) {
          typeCommand(lines[1], 'capture-anim record https://example.com', 2500);
        }
        ctaObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });

  ctaObserver.observe(ctaTerminal);
}

// ==========================================
// Demo Button Interactions (Enhanced feedback)
// ==========================================

const demoButtons = document.querySelectorAll('.demo-button');
demoButtons.forEach(btn => {
  btn.addEventListener('click', function(e) {
    // Create ripple effect
    const ripple = document.createElement('span');
    const rect = this.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = e.clientX - rect.left - size / 2;
    const y = e.clientY - rect.top - size / 2;

    ripple.style.width = ripple.style.height = size + 'px';
    ripple.style.left = x + 'px';
    ripple.style.top = y + 'px';
    ripple.style.position = 'absolute';
    ripple.style.borderRadius = '50%';
    ripple.style.background = 'rgba(255, 255, 255, 0.5)';
    ripple.style.transform = 'scale(0)';
    ripple.style.animation = 'ripple 600ms ease-out';
    ripple.style.pointerEvents = 'none';

    this.style.position = 'relative';
    this.style.overflow = 'hidden';
    this.appendChild(ripple);

    setTimeout(() => ripple.remove(), 600);
  });
});

// Add ripple animation
const style = document.createElement('style');
style.textContent = `
  @keyframes ripple {
    to {
      transform: scale(4);
      opacity: 0;
    }
  }
`;
document.head.appendChild(style);

// ==========================================
// Parallax Effect for Hero Orbs
// ==========================================

const orbs = document.querySelectorAll('.gradient-orb');

window.addEventListener('mousemove', (e) => {
  const mouseX = e.clientX / window.innerWidth;
  const mouseY = e.clientY / window.innerHeight;

  orbs.forEach((orb, index) => {
    const speed = (index + 1) * 20;
    const x = (mouseX - 0.5) * speed;
    const y = (mouseY - 0.5) * speed;

    orb.style.transform = `translate(${x}px, ${y}px)`;
  });
});

// ==========================================
// Cursor Trail Effect (Optional Enhancement)
// ==========================================

let cursorTrail = [];
const maxTrailLength = 20;
let isTrailActive = false;

function createTrailDot(x, y) {
  const dot = document.createElement('div');
  dot.className = 'cursor-dot';
  dot.style.cssText = `
    position: fixed;
    width: 6px;
    height: 6px;
    background: rgba(0, 212, 255, 0.5);
    border-radius: 50%;
    pointer-events: none;
    z-index: 9999;
    left: ${x}px;
    top: ${y}px;
    transform: translate(-50%, -50%);
    transition: opacity 0.3s ease;
  `;

  document.body.appendChild(dot);

  setTimeout(() => {
    dot.style.opacity = '0';
    setTimeout(() => dot.remove(), 300);
  }, 500);
}

// Activate trail on hero section
const hero = document.querySelector('.hero');
if (hero) {
  hero.addEventListener('mouseenter', () => {
    isTrailActive = true;
  });

  hero.addEventListener('mouseleave', () => {
    isTrailActive = false;
  });

  let trailTimer = null;
  document.addEventListener('mousemove', (e) => {
    if (isTrailActive) {
      if (!trailTimer) {
        trailTimer = setTimeout(() => {
          createTrailDot(e.clientX, e.clientY);
          trailTimer = null;
        }, 50);
      }
    }
  });
}

// ==========================================
// Performance: Reduce motion for users who prefer it
// ==========================================

const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

if (prefersReducedMotion.matches) {
  // Disable animations for users who prefer reduced motion
  document.documentElement.style.setProperty('--transition-fast', '0ms');
  document.documentElement.style.setProperty('--transition-base', '0ms');
  document.documentElement.style.setProperty('--transition-slow', '0ms');

  // Remove animation classes
  document.querySelectorAll('[style*="animation"]').forEach(el => {
    el.style.animation = 'none';
  });
}

// ==========================================
// Stats Counter Animation
// ==========================================

function animateCounter(element, target, duration = 2000) {
  const start = 0;
  const startTime = performance.now();

  function update(currentTime) {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);

    // Easing function (ease-out)
    const easeOut = 1 - Math.pow(1 - progress, 3);
    const current = Math.floor(start + (target - start) * easeOut);

    element.textContent = current;

    if (progress < 1) {
      requestAnimationFrame(update);
    } else {
      element.textContent = target;
    }
  }

  requestAnimationFrame(update);
}

// Observe stats and trigger counter animation
const statValues = document.querySelectorAll('.stat-value');
statValues.forEach(stat => {
  const statObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const target = parseInt(entry.target.textContent);
        animateCounter(entry.target, target);
        statObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });

  statObserver.observe(stat);
});

// ==========================================
// Loading Performance
// ==========================================

// Preload critical fonts
const fontPreload = document.createElement('link');
fontPreload.rel = 'preload';
fontPreload.as = 'font';
fontPreload.type = 'font/woff2';
fontPreload.crossOrigin = 'anonymous';
document.head.appendChild(fontPreload);

// ==========================================
// Console Easter Egg
// ==========================================

console.log('%c🎬 Animation Capture Tool', 'font-size: 24px; font-weight: bold; color: #00d4ff;');
console.log('%cInterested in how this site was built?', 'font-size: 14px; color: #a0a0b8;');
console.log('%cThis frontend was designed to showcase the tool itself!', 'font-size: 14px; color: #a0a0b8;');
console.log('%cCheck out the code: https://github.com', 'font-size: 14px; color: #00ff88;');

// ==========================================
// Initialize
// ==========================================

document.addEventListener('DOMContentLoaded', () => {
  console.log('✅ Animation Capture Tool frontend loaded');

  // Add loaded class to body for any CSS transitions that should wait
  document.body.classList.add('loaded');
});
