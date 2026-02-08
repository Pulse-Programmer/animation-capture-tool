# Optimized AI Prompt Template

Use this template with captured data for best AI code generation results.

## Basic Template (Vanilla JS)

```
You are an expert frontend engineer specializing in web animations.

Your task: Recreate the following captured animations as production-ready code.

Requirements:
- Use vanilla JavaScript (no frameworks unless specified)
- Implement using CSS transitions/animations where possible
- Add event listeners for triggers
- Match the exact timing and easing functions
- Keep code minimal and performant
- Include comments explaining the animation logic
- Ensure cross-browser compatibility

Captured Animation Data:
[Paste ai-output.json or specific animation profile here]

Deliverables:
1. Complete HTML structure (if needed)
2. CSS with transitions/animations
3. JavaScript for event handling
4. Brief explanation of how it works

Optimization priorities:
- Prefer CSS over JavaScript animations
- Use `will-change` for performance where appropriate
- Implement `requestAnimationFrame` for JS animations
- Add proper cleanup and edge case handling
```

## React Template

```
You are a React expert developer.

Task: Convert these captured animations into React components.

Tech stack:
- React 18+ with hooks
- TypeScript (provide types)
- CSS Modules or styled-components (your choice)
- Framer Motion (optional, only if complex)

Requirements:
- Use proper React patterns (hooks, memo, etc.)
- Handle edge cases (unmounting, rapid interactions)
- Make components reusable with props
- Include TypeScript interfaces
- Add JSDoc comments

Captured Animation Data:
[Paste ai-output.json here]

Deliverables:
1. React component(s) with TypeScript
2. Styled component or CSS module
3. Usage example
4. Props documentation
```

## Tailwind CSS Template

```
You are a Tailwind CSS expert.

Task: Recreate these animations using Tailwind utility classes.

Requirements:
- Use only Tailwind classes (including arbitrary values if needed)
- Leverage Tailwind transitions and animations
- Add custom animations in tailwind.config.js if necessary
- Keep markup semantic and accessible
- Use @apply sparingly (prefer utility classes)

Captured Animation Data:
[Paste ai-output.json here]

Deliverables:
1. HTML with Tailwind classes
2. Custom animations for tailwind.config.js (if needed)
3. JavaScript for complex interactions (if needed)
```

## Animation Library Template

```
You are creating a reusable animation library.

Task: Extract these animations into a standalone animation utility.

Requirements:
- Create named animation functions/classes
- Make animations configurable (duration, easing, etc.)
- Provide both imperative and declarative APIs
- Include TypeScript definitions
- Add chainable API if appropriate
- Consider accessibility (prefers-reduced-motion)

Captured Animation Data:
[Paste ai-output.json here]

Deliverables:
1. Animation utility/library code
2. TypeScript definitions
3. Usage examples (multiple scenarios)
4. API documentation
```

## Advanced Template (Complex Animations)

```
You are an expert in complex web animations.

Task: Recreate these animations with production-grade implementation.

Requirements:
- Use the most appropriate technology (CSS, JS, Canvas, SVG, etc.)
- Implement proper animation lifecycle management
- Add performance optimizations (debouncing, throttling, etc.)
- Handle accessibility (respect prefers-reduced-motion)
- Include fallbacks for older browsers
- Add proper TypeScript types
- Implement state management if needed
- Consider mobile performance

Captured Animation Data:
[Paste ai-output.json here]

Additional context:
- Target browsers: [Specify browser support]
- Performance budget: [Specify if relevant]
- Framework: [React/Vue/Svelte/Vanilla]

Deliverables:
1. Complete implementation
2. Performance considerations document
3. Accessibility notes
4. Browser compatibility notes
5. Usage guide with examples
```

## Tips for Best Results

### 1. Be Specific About Context

Add this to your prompt:
```
Context about the project:
- This will be used in [describe project]
- Target audience: [desktop/mobile/both]
- Brand style: [minimal/playful/professional]
- Performance requirements: [critical/normal/flexible]
```

### 2. Specify Constraints

```
Constraints:
- Bundle size: Keep under [X]kb
- No external dependencies except [list]
- Must work on [browser versions]
- Animation should complete in [X]ms max
```

### 3. Request Variations

```
Please provide 3 variations:
1. Most performant (CSS-only if possible)
2. Most flexible (configurable parameters)
3. Most accessible (respects user preferences)
```

### 4. Ask for Explanations

```
For each animation, explain:
- Why you chose this implementation approach
- Performance implications
- Browser compatibility considerations
- Potential improvements
```

## Example: Complete Prompt for Modal Animation

```
You are an expert frontend engineer.

Task: Recreate this modal opening animation as production-ready React component.

Tech Stack:
- React 18 with TypeScript
- CSS Modules
- No external animation libraries

Animation Data:
{
  "name": "modal-open",
  "trigger": {
    "event": "click",
    "selector": "button[data-action='open-modal']"
  },
  "effect": {
    "type": "transition",
    "target": "div.modal",
    "properties": {
      "opacity": { "from": "0", "to": "1" },
      "transform": { "from": "scale(0.9)", "to": "scale(1)" },
      "display": { "from": "none", "to": "flex" }
    },
    "timing": {
      "duration": "300ms",
      "easing": "cubic-bezier(0.4, 0, 0.2, 1)"
    }
  }
}

Requirements:
1. Modal should animate in with fade + scale
2. Include backdrop with fade-in
3. Handle edge cases (rapid open/close, escape key, backdrop click)
4. Respect prefers-reduced-motion
5. Focus management (trap focus in modal, return focus on close)
6. Make it reusable with props: isOpen, onClose, children

Deliverables:
1. Modal.tsx component with TypeScript
2. Modal.module.css
3. Usage example
4. Explanation of implementation choices

Accessibility considerations:
- Add proper ARIA attributes
- Keyboard navigation support
- Focus trap when open
- Announce to screen readers
```

## Testing Your Prompt

Before using with AI, check:
- [ ] Included complete animation data
- [ ] Specified tech stack clearly
- [ ] Listed all requirements
- [ ] Added context about usage
- [ ] Mentioned accessibility needs
- [ ] Specified deliverables
- [ ] Included any constraints

## Iterating on Results

If the first generation isn't perfect:

```
Thanks! This is close, but please adjust:

1. [Specific change needed]
2. [Another adjustment]
3. [Additional requirement]

Keep everything else the same.
```

---

Remember: The more specific your prompt, the better the AI-generated code will be!
