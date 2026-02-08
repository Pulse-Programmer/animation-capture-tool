# Example: Button Click Animation

This is an example of what the tool captures when recording a button click animation.

## Source

**URL**: https://example.com/demo
**Interaction**: Click on "Get Started" button
**Duration**: 3.2 seconds

## Captured Animation Profile

```json
{
  "name": "click-on-button.get-started",
  "trigger": {
    "event": "click",
    "selector": "button[data-testid='get-started']"
  },
  "effect": {
    "type": "transition",
    "target": "button[data-testid='get-started']",
    "properties": {
      "transform": {
        "from": "scale(1) translateY(0px)",
        "to": "scale(0.95) translateY(2px)"
      },
      "opacity": {
        "from": "1",
        "to": "0.8"
      },
      "box-shadow": {
        "from": "0 4px 6px rgba(0,0,0,0.1)",
        "to": "0 2px 4px rgba(0,0,0,0.1)"
      }
    },
    "timing": {
      "duration": "150ms",
      "easing": "cubic-bezier(0.4, 0, 0.2, 1)"
    }
  }
}
```

## AI Prompt Generated

```
You are a frontend engineer.

Given static HTML and these interaction traces, generate minimal JavaScript that recreates the observed behavior.

Do not invent features.
Prefer event listeners and class toggles.
Use vanilla JS unless stated otherwise.

### click-on-button.get-started

Trigger: click on selector "button[data-testid='get-started']"
Effect: transition
Target: button[data-testid='get-started']

Properties to animate:
- transform: scale(1) translateY(0px) → scale(0.95) translateY(2px)
- opacity: 1 → 0.8
- box-shadow: 0 4px 6px rgba(0,0,0,0.1) → 0 2px 4px rgba(0,0,0,0.1)

Timing:
- Duration: 150ms
- Easing: cubic-bezier(0.4, 0, 0.2, 1)

Generate:
1. HTML structure (if needed)
2. CSS classes/animations
3. JavaScript event handlers
4. Ensure the animation is smooth and matches the timing

Provide complete, working code that can be directly used in a project.
```

## AI Generated Code (Example)

Here's what an AI agent like Claude might generate:

### HTML
```html
<button 
  data-testid="get-started" 
  class="btn-primary"
>
  Get Started
</button>
```

### CSS
```css
.btn-primary {
  padding: 12px 24px;
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 16px;
  font-weight: 600;
  transition: all 150ms cubic-bezier(0.4, 0, 0.2, 1);
  transform: scale(1) translateY(0px);
  opacity: 1;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.btn-primary:active {
  transform: scale(0.95) translateY(2px);
  opacity: 0.8;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}
```

### JavaScript (Alternative approach)
```javascript
const button = document.querySelector('button[data-testid="get-started"]');

button.addEventListener('mousedown', () => {
  button.style.transition = 'all 150ms cubic-bezier(0.4, 0, 0.2, 1)';
  button.style.transform = 'scale(0.95) translateY(2px)';
  button.style.opacity = '0.8';
  button.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.1)';
});

button.addEventListener('mouseup', () => {
  button.style.transform = 'scale(1) translateY(0px)';
  button.style.opacity = '1';
  button.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.1)';
});

button.addEventListener('mouseleave', () => {
  button.style.transform = 'scale(1) translateY(0px)';
  button.style.opacity = '1';
  button.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.1)';
});
```

## Raw Trace Data

This is what the tool actually captured (simplified):

```json
{
  "ts": 1738028431234,
  "type": "interaction",
  "sessionId": "session_1738028428_xyz",
  "url": "https://example.com/demo",
  "viewport": {
    "width": 1920,
    "height": 1080
  },
  "event": {
    "kind": "click",
    "selector": "button[data-testid='get-started']",
    "x": 640,
    "y": 350
  },
  "before": {
    "dom": {
      "selector": "button[data-testid='get-started']",
      "attributes": {
        "data-testid": "get-started",
        "type": "button"
      },
      "classes": ["btn-primary"],
      "text": "Get Started"
    },
    "style": {
      "selector": "button[data-testid='get-started']",
      "computed": {
        "transform": "scale(1) translateY(0px)",
        "opacity": "1",
        "box-shadow": "0 4px 6px rgba(0,0,0,0.1)",
        "transition": "all 150ms cubic-bezier(0.4, 0, 0.2, 1)"
      }
    }
  },
  "after": {
    "dom": {
      "selector": "button[data-testid='get-started']",
      "attributes": {
        "data-testid": "get-started",
        "type": "button"
      },
      "classes": ["btn-primary", "active"],
      "text": "Get Started"
    },
    "style": {
      "selector": "button[data-testid='get-started']",
      "computed": {
        "transform": "scale(0.95) translateY(2px)",
        "opacity": "0.8",
        "box-shadow": "0 2px 4px rgba(0,0,0,0.1)",
        "transition": "all 150ms cubic-bezier(0.4, 0, 0.2, 1)"
      }
    }
  }
}
```

## Usage Notes

1. **Clean capture**: The tool filtered out framework noise and focused on meaningful style changes
2. **Stable selector**: Used semantic `data-testid` attribute for reliable selection
3. **Complete timing**: Captured exact transition duration and easing function
4. **All properties**: Recorded transform, opacity, and box-shadow changes
5. **AI-ready**: Structured output that AI can easily convert to code

## Real-World Variations

Different AI agents might generate slightly different implementations:

### React Version
```jsx
function GetStartedButton() {
  const [isActive, setIsActive] = useState(false);

  return (
    <button
      data-testid="get-started"
      className={`btn-primary ${isActive ? 'active' : ''}`}
      onMouseDown={() => setIsActive(true)}
      onMouseUp={() => setIsActive(false)}
      onMouseLeave={() => setIsActive(false)}
    >
      Get Started
    </button>
  );
}
```

### Tailwind CSS Version
```html
<button
  data-testid="get-started"
  class="px-6 py-3 bg-blue-500 text-white rounded-lg
         transition-all duration-150 ease-out
         hover:shadow-md active:scale-95 active:translate-y-0.5
         active:opacity-80 active:shadow-sm"
>
  Get Started
</button>
```

### CSS Animation Version
```css
@keyframes button-press {
  0% {
    transform: scale(1) translateY(0px);
    opacity: 1;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  }
  100% {
    transform: scale(0.95) translateY(2px);
    opacity: 0.8;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }
}

.btn-primary:active {
  animation: button-press 150ms cubic-bezier(0.4, 0, 0.2, 1) forwards;
}
```

## Key Takeaways

- ✅ Captured exact timing and easing
- ✅ Recorded all visual property changes
- ✅ Generated reliable, semantic selector
- ✅ Filtered out framework noise
- ✅ AI can generate multiple valid implementations
- ✅ Code is production-ready with minimal tweaking
