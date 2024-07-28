import { ClassNameValue, twMerge } from 'tailwind-merge'

export const cn = (...classes: ClassNameValue[]) => {
  return twMerge(classes)
}

declare global {
  interface Window {
    /**
     * This is how we're passing callbacks to custom elements.
     * Since we can't pass functions as input to custom elements,
     */
    customElementsCallbacks: Map<string, Function>
  }
}

if (typeof window !== 'undefined' && 'customElements' in window) {
  window.customElementsCallbacks = new Map()
}
