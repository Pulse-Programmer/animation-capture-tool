/**
 * Stable Selector Engine
 *
 * Generates reliable, framework-agnostic selectors that:
 * - Ignore transient attributes (React keys, Vue IDs, etc.)
 * - Prefer semantic attributes (id, name, aria-label, data-testid)
 * - Fall back to structural paths only when necessary
 * - Are resilient to minor DOM changes
 */

export interface SelectorOptions {
  ignoreAttributes?: string[];
  preferredAttributes?: string[];
  maxDepth?: number;
}

const DEFAULT_IGNORED_ATTRIBUTES = [
  "data-reactid",
  "data-react-checksum",
  "data-v-", // Vue
  "data-svelte-",
  "_ngcontent-", // Angular
  "_nghost-",
  "data-emotion-",
  "data-styled-",
  "ng-reflect-",
];

const DEFAULT_PREFERRED_ATTRIBUTES = [
  "id",
  "data-testid",
  "data-test",
  "data-id",
  "name",
  "aria-label",
  "role",
  "type",
  "href",
  "for",
];

export class StableSelectorEngine {
  private options: Required<SelectorOptions>;

  constructor(options: SelectorOptions = {}) {
    this.options = {
      ignoreAttributes: options.ignoreAttributes || DEFAULT_IGNORED_ATTRIBUTES,
      preferredAttributes:
        options.preferredAttributes || DEFAULT_PREFERRED_ATTRIBUTES,
      maxDepth: options.maxDepth || 5,
    };
  }

  /**
   * Generate a stable selector for an element
   */
  generate(element: Element): string {
    // Try preferred attributes first
    const attributeSelector = this.getAttributeSelector(element);
    if (attributeSelector && this.isUnique(element, attributeSelector)) {
      return attributeSelector;
    }

    // Try class-based selector
    const classSelector = this.getClassSelector(element);
    if (classSelector && this.isUnique(element, classSelector)) {
      return classSelector;
    }

    // Fall back to structural path
    return this.getStructuralPath(element);
  }

  /**
   * Get selector based on preferred attributes
   */
  private getAttributeSelector(element: Element): string | null {
    for (const attr of this.options.preferredAttributes) {
      const value = element.getAttribute(attr);
      if (value) {
        // Clean the value and create selector
        const cleanValue = this.cleanAttributeValue(value);
        if (cleanValue) {
          const selector = `${element.tagName.toLowerCase()}[${attr}="${cleanValue}"]`;
          return selector;
        }
      }
    }
    return null;
  }

  /**
   * Get selector based on meaningful classes
   */
  private getClassSelector(element: Element): string | null {
    const classes = Array.from(element.classList).filter((cls: string) =>
      this.isMeaningfulClass(cls),
    );

    if (classes.length === 0) return null;

    // Try single class first
    for (const cls of classes) {
      const selector = `${element.tagName.toLowerCase()}.${cls}`;
      if (this.isUnique(element, selector)) {
        return selector;
      }
    }

    // Try combination of classes
    if (classes.length > 1) {
      const selector = `${element.tagName.toLowerCase()}.${classes.join(".")}`;
      if (this.isUnique(element, selector)) {
        return selector;
      }
    }

    return null;
  }

  /**
   * Get structural path as last resort
   */
  private getStructuralPath(element: Element): string {
    const path: string[] = [];
    let current: Element | null = element;
    let depth = 0;

    while (
      current &&
      current !== document.documentElement &&
      depth < this.options.maxDepth
    ) {
      let selector = current.tagName.toLowerCase();

      // Add nth-child if there are siblings of same type
      const siblings = current.parentElement?.children;
      if (siblings && siblings.length > 1) {
        const sameTypeSiblings = Array.from(siblings).filter(
          (s: Element) => s.tagName === current!.tagName,
        );
        if (sameTypeSiblings.length > 1) {
          const index = sameTypeSiblings.indexOf(current) + 1;
          selector += `:nth-of-type(${index})`;
        }
      }

      path.unshift(selector);
      current = current.parentElement;
      depth++;
    }

    return path.join(" > ");
  }

  /**
   * Check if a class name is meaningful (not auto-generated)
   */
  private isMeaningfulClass(className: string): boolean {
    // Ignore framework-generated classes
    if (
      this.options.ignoreAttributes.some((pattern) =>
        className.includes(pattern),
      )
    ) {
      return false;
    }

    // Ignore hash-based classes (e.g., css-1a2b3c4)
    if (/^[a-z]+-[a-f0-9]{6,}$/i.test(className)) {
      return false;
    }

    // Ignore very short or numeric classes
    if (className.length < 3 || /^\d+$/.test(className)) {
      return false;
    }

    return true;
  }

  /**
   * Clean attribute value (remove framework artifacts)
   */
  private cleanAttributeValue(value: string): string {
    // Remove framework prefixes
    return value.replace(/^(react-|vue-|ng-|svelte-)/, "");
  }

  /**
   * Check if selector uniquely identifies the element
   */
  private isUnique(element: Element, selector: string): boolean {
    try {
      const matches = document.querySelectorAll(selector);
      return matches.length === 1 && matches[0] === element;
    } catch {
      return false;
    }
  }
}

/**
 * Serializable version for injection into page context
 */
export function getStableSelectorScript(): string {
  return `
(${StableSelectorEngine.toString()})

// Create global instance
window.__stableSelectorEngine = new StableSelectorEngine();

// Helper function for easy access
window.getStableSelector = function(element) {
  return window.__stableSelectorEngine.generate(element);
};
`;
}
