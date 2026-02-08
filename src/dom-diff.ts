/**
 * DOM Diff Compression
 *
 * Extracts meaningful DOM changes while filtering out:
 * - Framework re-renders that don't change visible state
 * - Transient attributes
 * - Rendering artifacts
 * - Irrelevant style changes
 */

export interface DOMNode {
  tag: string;
  attributes: Record<string, string>;
  classes: string[];
  text?: string;
  children?: DOMNode[];
}

export interface DOMDiff {
  type: "add" | "remove" | "modify" | "move";
  path: string;
  node?: DOMNode;
  changes?: {
    attributes?: Record<string, { from: string; to: string }>;
    classes?: { added: string[]; removed: string[] };
    text?: { from: string; to: string };
  };
}

export interface StyleDiff {
  selector: string;
  changes: Record<string, { from: string; to: string }>;
}

const MEANINGFUL_STYLE_PROPERTIES = [
  "display",
  "visibility",
  "opacity",
  "transform",
  "transition",
  "animation",
  "position",
  "top",
  "left",
  "right",
  "bottom",
  "width",
  "height",
  "z-index",
  "overflow",
  "clip-path",
  "filter",
  "backdrop-filter",
];

const IGNORED_ATTRIBUTES = [
  "data-reactid",
  "data-react-checksum",
  "data-v-",
  "data-svelte-",
  "_ngcontent-",
  "_nghost-",
  "data-emotion-",
  "data-styled-",
];

export class DOMDiffCompressor {
  /**
   * Serialize element to compact representation
   */
  serializeNode(element: Element): DOMNode {
    const node: DOMNode = {
      tag: element.tagName.toLowerCase(),
      attributes: this.getMeaningfulAttributes(element),
      classes: this.getMeaningfulClasses(element),
    };

    // Include text content only if it's a leaf text node
    const textContent = this.getDirectTextContent(element);
    if (textContent) {
      node.text = textContent;
    }

    return node;
  }

  /**
   * Get only meaningful attributes (filter framework noise)
   */
  private getMeaningfulAttributes(element: Element): Record<string, string> {
    const attrs: Record<string, string> = {};

    for (let i = 0; i < element.attributes.length; i++) {
      const attr = element.attributes[i];

      // Skip ignored attributes
      if (IGNORED_ATTRIBUTES.some((ignored) => attr.name.startsWith(ignored))) {
        continue;
      }

      // Skip inline styles (we capture computed styles separately)
      if (attr.name === "style") {
        continue;
      }

      // Skip class (we handle separately)
      if (attr.name === "class") {
        continue;
      }

      attrs[attr.name] = attr.value;
    }

    return attrs;
  }

  /**
   * Get meaningful classes (filter framework-generated ones)
   */
  private getMeaningfulClasses(element: Element): string[] {
    return Array.from(element.classList).filter((cls: string) => {
      // Filter out framework classes
      if (IGNORED_ATTRIBUTES.some((ignored) => cls.includes(ignored))) {
        return false;
      }

      // Filter out hash-based classes
      if (/^[a-z]+-[a-f0-9]{6,}$/i.test(cls)) {
        return false;
      }

      return true;
    });
  }

  /**
   * Get direct text content (not from children)
   */
  private getDirectTextContent(element: Element): string {
    let text = "";
    const nodes = Array.from(element.childNodes);
    for (const node of nodes) {
      if (node.nodeType === 3) {
        // Node.TEXT_NODE = 3
        text += node.textContent || "";
      }
    }
    return text.trim();
  }

  /**
   * Compare two DOM states and extract meaningful diff
   */
  computeDiff(before: Element, after: Element): DOMDiff | null {
    const beforeNode = this.serializeNode(before);
    const afterNode = this.serializeNode(after);

    // Check for modifications
    const changes: DOMDiff["changes"] = {};

    // Compare attributes
    const attrChanges = this.compareAttributes(
      beforeNode.attributes,
      afterNode.attributes,
    );
    if (Object.keys(attrChanges).length > 0) {
      changes.attributes = attrChanges;
    }

    // Compare classes
    const classChanges = this.compareClasses(
      beforeNode.classes,
      afterNode.classes,
    );
    if (classChanges.added.length > 0 || classChanges.removed.length > 0) {
      changes.classes = classChanges;
    }

    // Compare text
    if (
      beforeNode.text !== afterNode.text &&
      (beforeNode.text || afterNode.text)
    ) {
      changes.text = {
        from: beforeNode.text || "",
        to: afterNode.text || "",
      };
    }

    // Return null if no meaningful changes
    if (Object.keys(changes).length === 0) {
      return null;
    }

    return {
      type: "modify",
      path: "", // Will be set by caller
      changes,
    };
  }

  /**
   * Compare attributes
   */
  private compareAttributes(
    before: Record<string, string>,
    after: Record<string, string>,
  ): Record<string, { from: string; to: string }> {
    const changes: Record<string, { from: string; to: string }> = {};

    // Check modified and removed
    for (const [key, value] of Object.entries(before)) {
      if (after[key] !== value) {
        changes[key] = { from: value, to: after[key] || "" };
      }
    }

    // Check added
    for (const [key, value] of Object.entries(after)) {
      if (!(key in before)) {
        changes[key] = { from: "", to: value };
      }
    }

    return changes;
  }

  /**
   * Compare classes
   */
  private compareClasses(
    before: string[],
    after: string[],
  ): { added: string[]; removed: string[] } {
    const beforeSet = new Set(before);
    const afterSet = new Set(after);

    return {
      added: after.filter((cls) => !beforeSet.has(cls)),
      removed: before.filter((cls) => !afterSet.has(cls)),
    };
  }

  /**
   * Extract meaningful style changes
   */
  computeStyleDiff(
    element: Element,
    beforeStyles: CSSStyleDeclaration,
    afterStyles: CSSStyleDeclaration,
  ): StyleDiff | null {
    const changes: Record<string, { from: string; to: string }> = {};

    for (const prop of MEANINGFUL_STYLE_PROPERTIES) {
      const before = beforeStyles.getPropertyValue(prop);
      const after = afterStyles.getPropertyValue(prop);

      if (before !== after && this.isSignificantChange(prop, before, after)) {
        changes[prop] = { from: before, to: after };
      }
    }

    if (Object.keys(changes).length === 0) {
      return null;
    }

    return {
      selector: "", // Will be set by caller
      changes,
    };
  }

  /**
   * Check if style change is significant
   */
  private isSignificantChange(
    property: string,
    from: string,
    to: string,
  ): boolean {
    // Empty to empty is not significant
    if (!from && !to) return false;

    // For numeric properties, check if change is meaningful
    if (
      ["width", "height", "top", "left", "right", "bottom"].includes(property)
    ) {
      const fromNum = parseFloat(from);
      const toNum = parseFloat(to);

      if (!isNaN(fromNum) && !isNaN(toNum)) {
        // Ignore changes smaller than 1px
        return Math.abs(toNum - fromNum) >= 1;
      }
    }

    // For opacity, ignore very small changes
    if (property === "opacity") {
      const fromNum = parseFloat(from);
      const toNum = parseFloat(to);

      if (!isNaN(fromNum) && !isNaN(toNum)) {
        return Math.abs(toNum - fromNum) >= 0.01;
      }
    }

    return true;
  }

  /**
   * Compress mutation records to extract intent
   */
  compressMutations(mutations: MutationRecord[]): {
    intent: string;
    summary: string;
    affectedElements: number;
  } {
    const affectedElements = new Set<Element>();
    let hasAttributeChanges = false;
    let hasChildListChanges = false;
    let hasClassChanges = false;

    for (const mutation of mutations) {
      if (mutation.target instanceof Element) {
        affectedElements.add(mutation.target);
      }

      if (mutation.type === "attributes") {
        hasAttributeChanges = true;
        if (mutation.attributeName === "class") {
          hasClassChanges = true;
        }
      } else if (mutation.type === "childList") {
        hasChildListChanges = true;
      }
    }

    // Infer intent
    let intent = "unknown";
    if (hasClassChanges && !hasChildListChanges) {
      intent = "style-change";
    } else if (hasChildListChanges && affectedElements.size === 1) {
      intent = "content-update";
    } else if (hasChildListChanges && affectedElements.size > 1) {
      intent = "dom-restructure";
    } else if (hasAttributeChanges) {
      intent = "attribute-change";
    }

    return {
      intent,
      summary: `${mutations.length} mutations on ${affectedElements.size} elements`,
      affectedElements: affectedElements.size,
    };
  }
}
