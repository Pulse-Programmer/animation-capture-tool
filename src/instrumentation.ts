/**
 * Browser Instrumentation Script
 *
 * This script is injected into target pages to capture interactions
 * It runs in the page context and communicates back to Playwright
 */

export function getInstrumentationScript(): string {
  return `
(function() {
  'use strict';
  
  // Stable Selector Engine (inline)
  ${getStableSelectorEngineInline()}
  
  // DOM Diff Engine (inline)
  ${getDOMDiffEngineInline()}
  
  // State management
  const state = {
    recording: true,
    capturedElements: new WeakMap(),
    lastEventTime: 0,
    pendingMutations: [],
    mutationTimer: null,
  };
  
  // Meaningful style properties to track
  const MEANINGFUL_STYLES = [
    'display', 'visibility', 'opacity', 'transform', 'transition', 'animation',
    'position', 'top', 'left', 'right', 'bottom', 'width', 'height', 'z-index',
    'overflow', 'clip-path', 'filter', 'backdrop-filter'
  ];
  
  // Initialize selector engine
  const selectorEngine = new StableSelectorEngine();
  const diffEngine = new DOMDiffCompressor();
  
  /**
   * Capture computed styles for an element
   */
  function captureStyles(element) {
    if (!(element instanceof HTMLElement)) return {};
    
    const computed = window.getComputedStyle(element);
    const styles = {};
    
    for (const prop of MEANINGFUL_STYLES) {
      const value = computed.getPropertyValue(prop);
      if (value) {
        styles[prop] = value;
      }
    }
    
    return styles;
  }
  
  /**
   * Capture DOM snapshot
   */
  function captureSnapshot(element) {
    if (!(element instanceof HTMLElement)) return null;
    
    return {
      selector: selectorEngine.generate(element),
      html: element.outerHTML.substring(0, 500), // Limit size
      attributes: diffEngine.serializeNode(element).attributes,
      classes: Array.from(element.classList),
      text: element.textContent?.substring(0, 200)
    };
  }
  
  /**
   * Send trace to parent (Playwright)
   */
  function sendTrace(data) {
    if (!state.recording) return;
    
    if (window.__captureCallback) {
      try {
        window.__captureCallback(data);
      } catch (error) {
        console.error('Failed to send trace:', error);
      }
    } else {
      console.warn('__captureCallback not available');
    }
  }
  
  /**
   * Debounce function
   */
  function debounce(func, wait) {
    let timeout;
    return function(...args) {
      clearTimeout(timeout);
      timeout = setTimeout(() => func.apply(this, args), wait);
    };
  }
  
  /**
   * Handle interaction events
   */
  function handleInteraction(event) {
    const target = event.target;
    if (!(target instanceof HTMLElement)) return;
    
    // Capture before state
    const beforeDOM = captureSnapshot(target);
    const beforeStyle = captureStyles(target);
    
    // Wait for potential DOM/style changes
    requestAnimationFrame(() => {
      setTimeout(() => {
        const afterDOM = captureSnapshot(target);
        const afterStyle = captureStyles(target);
        
        // Check if anything changed
        const hasChanges = JSON.stringify(beforeStyle) !== JSON.stringify(afterStyle) ||
                          beforeDOM.classes.join(',') !== afterDOM.classes.join(',');
        
        if (!hasChanges && event.type !== 'click' && event.type !== 'submit') {
          return; // Skip non-interactive events with no visual effect
        }
        
        const trace = {
          ts: Date.now(),
          type: 'interaction',
          event: {
            kind: event.type,
            selector: selectorEngine.generate(target),
            x: event.clientX,
            y: event.clientY,
            value: target.value,
            key: event.key
          },
          before: {
            dom: beforeDOM,
            style: {
              selector: selectorEngine.generate(target),
              computed: beforeStyle
            }
          },
          after: {
            dom: afterDOM,
            style: {
              selector: selectorEngine.generate(target),
              computed: afterStyle
            }
          },
          viewport: {
            width: window.innerWidth,
            height: window.innerHeight
          }
        };
        
        sendTrace(trace);
      }, 50); // Wait 50ms for changes
    });
  }
  
  /**
   * Handle mutations (debounced)
   */
  const processMutations = debounce(function() {
    if (state.pendingMutations.length === 0) return;
    
    const mutations = state.pendingMutations.splice(0);
    const compressed = diffEngine.compressMutations(mutations);
    
    // Only send if significant
    if (compressed.affectedElements > 0) {
      const changes = mutations
        .filter(m => m.target instanceof HTMLElement)
        .map(m => {
          const element = m.target;
          return {
            selector: selectorEngine.generate(element),
            type: m.type,
            details: {
              attributeName: m.attributeName,
              oldValue: m.oldValue,
              addedNodes: m.addedNodes.length,
              removedNodes: m.removedNodes.length
            }
          };
        })
        .slice(0, 5); // Limit to first 5 changes
      
      sendTrace({
        ts: Date.now(),
        type: 'mutation',
        mutation: {
          intent: compressed.intent,
          summary: compressed.summary,
          affectedElements: compressed.affectedElements,
          changes
        }
      });
    }
    
  }, 100);
  
  /**
   * Setup event listeners
   */
  function setupListeners() {
    // Interaction events
    const events = ['click', 'submit', 'input', 'focus', 'change'];
    
    events.forEach(eventType => {
      document.addEventListener(eventType, handleInteraction, true);
    });
    
    // Hover with throttling
    let lastHover = 0;
    document.addEventListener('mouseover', (e) => {
      const now = Date.now();
      if (now - lastHover < 200) return; // Throttle hovers
      lastHover = now;
      
      if (e.target instanceof HTMLElement && e.target.matches('a, button, [role="button"]')) {
        handleInteraction(e);
      }
    }, true);
    
    // Mutation observer
    const observer = new MutationObserver((mutations) => {
      state.pendingMutations.push(...mutations);
      processMutations();
    });
    
    observer.observe(document.body, {
      childList: true,
      attributes: true,
      attributeOldValue: true,
      subtree: true,
      attributeFilter: ['class', 'style', 'hidden', 'disabled', 'aria-expanded', 'aria-hidden']
    });
    
    // Store observer for cleanup
    window.__mutationObserver = observer;
  }
  
  /**
   * Cleanup
   */
  window.__stopCapture = function() {
    state.recording = false;
    if (window.__mutationObserver) {
      window.__mutationObserver.disconnect();
    }
  };
  
  // Initialize
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', setupListeners);
  } else {
    setupListeners();
  }
  
  // Send test trace immediately to confirm instrumentation is working
  if (window.__captureCallback) {
    try {
      window.__captureCallback({
        ts: Date.now(),
        type: 'test',
        message: 'Instrumentation loaded successfully'
      });
    } catch (e) {
      console.error('Failed to send test trace:', e);
    }
  }
  
  console.log('🎬 Animation Capture: Recording started');
})();
`;
}

// Inline version of StableSelectorEngine for injection
function getStableSelectorEngineInline(): string {
  return `
class StableSelectorEngine {
  constructor() {
    this.ignoredAttrs = ['data-reactid', 'data-react-checksum', 'data-v-', 'data-svelte-', '_ngcontent-', '_nghost-'];
    this.preferredAttrs = ['id', 'data-testid', 'data-test', 'data-id', 'name', 'aria-label', 'role', 'type'];
  }
  
  generate(element) {
    const attrSelector = this.getAttributeSelector(element);
    if (attrSelector && this.isUnique(element, attrSelector)) return attrSelector;
    
    const classSelector = this.getClassSelector(element);
    if (classSelector && this.isUnique(element, classSelector)) return classSelector;
    
    return this.getStructuralPath(element);
  }
  
  getAttributeSelector(element) {
    for (const attr of this.preferredAttrs) {
      const value = element.getAttribute(attr);
      if (value) {
        return \`\${element.tagName.toLowerCase()}[\${attr}="\${value}"]\`;
      }
    }
    return null;
  }
  
  getClassSelector(element) {
    const classes = Array.from(element.classList).filter(cls => 
      !this.ignoredAttrs.some(ign => cls.includes(ign)) && 
      !/^[a-z]+-[a-f0-9]{6,}$/i.test(cls) &&
      cls.length >= 3
    );
    
    if (classes.length === 0) return null;
    
    for (const cls of classes) {
      const selector = \`\${element.tagName.toLowerCase()}.\${cls}\`;
      if (this.isUnique(element, selector)) return selector;
    }
    
    if (classes.length > 1) {
      const selector = \`\${element.tagName.toLowerCase()}.\${classes.join('.')}\`;
      if (this.isUnique(element, selector)) return selector;
    }
    
    return null;
  }
  
  getStructuralPath(element) {
    const path = [];
    let current = element;
    let depth = 0;
    
    while (current && current !== document.documentElement && depth < 5) {
      let selector = current.tagName.toLowerCase();
      
      const siblings = current.parentElement?.children;
      if (siblings && siblings.length > 1) {
        const sameType = Array.from(siblings).filter(s => s.tagName === current.tagName);
        if (sameType.length > 1) {
          const index = sameType.indexOf(current) + 1;
          selector += \`:nth-of-type(\${index})\`;
        }
      }
      
      path.unshift(selector);
      current = current.parentElement;
      depth++;
    }
    
    return path.join(' > ');
  }
  
  isUnique(element, selector) {
    try {
      const matches = document.querySelectorAll(selector);
      return matches.length === 1 && matches[0] === element;
    } catch {
      return false;
    }
  }
}
`;
}

// Inline version of DOMDiffCompressor
function getDOMDiffEngineInline(): string {
  return `
class DOMDiffCompressor {
  serializeNode(element) {
    return {
      tag: element.tagName.toLowerCase(),
      attributes: this.getMeaningfulAttributes(element),
      classes: Array.from(element.classList).filter(cls => 
        !/^[a-z]+-[a-f0-9]{6,}$/i.test(cls) && cls.length >= 3
      )
    };
  }
  
  getMeaningfulAttributes(element) {
    const attrs = {};
    const ignored = ['data-reactid', 'data-v-', '_ngcontent-', 'style', 'class'];
    
    for (let i = 0; i < element.attributes.length; i++) {
      const attr = element.attributes[i];
      if (!ignored.some(ign => attr.name.startsWith(ign))) {
        attrs[attr.name] = attr.value;
      }
    }
    
    return attrs;
  }
  
  compressMutations(mutations) {
    const affected = new Set();
    let hasClass = false, hasChild = false;
    
    for (const m of mutations) {
      if (m.target instanceof Element) affected.add(m.target);
      if (m.type === 'attributes' && m.attributeName === 'class') hasClass = true;
      if (m.type === 'childList') hasChild = true;
    }
    
    let intent = 'unknown';
    if (hasClass && !hasChild) intent = 'style-change';
    else if (hasChild && affected.size === 1) intent = 'content-update';
    else if (hasChild) intent = 'dom-restructure';
    
    return {
      intent,
      summary: \`\${mutations.length} mutations on \${affected.size} elements\`,
      affectedElements: affected.size
    };
  }
}
`;
}
