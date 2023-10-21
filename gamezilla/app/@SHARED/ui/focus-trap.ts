const FOCUSABLE_ELEMENTS =
  'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';

const debug = false;

const log = (...args: unknown[]) => {
  if (debug) {
    log("[Focus Trap]", ...args);
  }
};

export const createFocusTrap = () => {
  let firstFocusableEl: HTMLElement | null = null;
  let lastFocusableEl: HTMLElement | null = null;

  let index = 0;
  const findFocusableElements = (root: HTMLElement) => {
    const focusableContent = root.querySelectorAll(FOCUSABLE_ELEMENTS);

    index = 0;
    for (const el of focusableContent) {
      if (!(el instanceof HTMLElement)) {
        continue;
      }

      lastFocusableEl = el;

      if (index === 0) {
        firstFocusableEl = el;
      }

      index++;
    }
  };

  const handleTrap = (e: KeyboardEvent) => {
    if (!firstFocusableEl || !lastFocusableEl) {
      log("no focusable elements");
      return;
    }

    if (e.key !== "Tab") {
      log("not tab");
      return;
    }

    if (e.shiftKey && document.activeElement === firstFocusableEl) {
      log("shift tab");
      e.preventDefault();
      lastFocusableEl?.focus();
      return;
    }

    if (document.activeElement === lastFocusableEl) {
      e.preventDefault();
      firstFocusableEl?.focus();
      return;
    }
  };

  const activate = (root: HTMLElement) => {
    root.focus();
    findFocusableElements(root);
    root.addEventListener("keydown", handleTrap);
    firstFocusableEl?.focus();
  };

  const deactivate = (root: HTMLElement) => {
    root.blur();
    root.removeEventListener("keydown", handleTrap);
  };

  return {
    activate,
    deactivate,
  };
};

export type FocusTrap = ReturnType<typeof createFocusTrap>;
