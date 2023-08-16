export type VDom = any | null | undefined;

export type VDomChildren = VDom | VDom[] | string | number | null | undefined;

export const cn = (
  ...classes: (string | boolean | number | undefined | null)[]
) => {
  return classes.filter(Boolean).join(" ");
};

export type StyleObject = {
  [key: string]: string | undefined;
};

export function toInlineStyles(styleObject: StyleObject): string {
  let inlineStyles = "";

  for (const property in styleObject) {
    if (styleObject.hasOwnProperty(property)) {
      const kebabCaseProperty = property
        .replace(/([a-z0-9]|(?=[A-Z]))([A-Z])/g, "$1-$2")
        .toLowerCase();

      const value = styleObject[property];

      if (!value) {
        continue;
      }

      inlineStyles += `${kebabCaseProperty}: ${value}; `;
    }
  }

  return inlineStyles;
}

declare global {
  interface Window {
    /**
     * This is how we're passing callbacks to custom elements.
     * Since we can't pass functions as props to custom elements,
     */
    customElementsCallbacks: Map<string, Function>;
  }
}

if (typeof window !== "undefined" && "customElements" in window) {
  window.customElementsCallbacks = new Map();
}
