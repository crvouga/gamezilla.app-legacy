import { FocusTrap, createFocusTrap } from "../focus-trap";
import { drawerSub, DrawerProps } from "./drawer-shared";

declare global {
  namespace preact.createElement.JSX {
    interface IntrinsicElements {
      "bottom-drawer": {
        id: string;
        children: unknown;
      };
    }
  }
  namespace JSX {
    interface IntrinsicElements {
      "bottom-drawer": {
        id: string;
        children: unknown;
      };
    }
  }
}

if (typeof window !== "undefined" && "customElements" in window) {
  class BottomDrawer extends HTMLElement {
    private backdrop: HTMLElement | null = null;
    private content: HTMLElement | null = null;
    private root: HTMLElement | null = null;

    private unsubscribe: () => void = () => {};
    private props: DrawerProps | null = null;
    private focusTrap: FocusTrap;

    constructor() {
      super();
      this.attachShadow({ mode: "open" });
      this.focusTrap = createFocusTrap();
    }

    disconnectedCallback() {
      this.unsubscribe();
    }

    connectedCallback() {
      this.initUI();
    }

    onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        this.props?.onClose();
      }
    }

    initUI() {
      this.unsubscribe = drawerSub.subscribe((event) => {
        if (event.id === this.getAttribute("id")) {
          this.props = event;
          this.syncUI();
        }
      });

      if (!this.shadowRoot) {
        return;
      }

      this.shadowRoot.innerHTML = `
      <style>
        .root {
          position: absolute;
          bottom: 0;
          left: 0;
          width: 100%;
          height: 100vh;
          overflow: hidden;
          display: flex;
          flex-direction: column;
          justify-content: flex-end;
          z-index: 100;
          background-color: rgba(0, 0, 0, 0);
          transition: background-color 0.2s ease-in-out;
        }
        .content {
          transition: transform 0.2s ease-in-out;
          transform: translateY(100%);
        }
        .backdrop {
          flex: 1;
          width: 100%;
          opacity: 0;
        }
        .darken-background {
          background-color: rgba(0, 0, 0, 0.5);
        }
        .visible {
          opacity: 1;
        }
        .open {
          transform: translateY(0%);
        }
        .pointer-events-none {
          pointer-events: none;
        }
      </style>
      <div class="root">
        <div class="backdrop"></div>
        <div class="content">
          <slot></slot>
        </div>
      </div>
    `;

      this.backdrop = this.shadowRoot.querySelector(".backdrop");
      this.content = this.shadowRoot.querySelector(".content");
      this.root = this.shadowRoot.querySelector(".root");

      this.root?.classList.add("pointer-events-none");

      this.backdrop?.addEventListener("click", () => {
        this.props?.onClose();
      });
    }

    syncUI() {
      if (!this.props || !this.content || !this.root || !this.backdrop) {
        return;
      }

      if (this.props.open) {
        this.content.classList.add("open");
        this.root.classList.remove("pointer-events-none");
        this.root.classList.add("darken-background");
        this.backdrop.classList.add("visible");
        this.root.tabIndex = 0;
        this.tabIndex = 0;
        // this.focusTrap.activate(this);
        this.addEventListener("keydown", this.onKeyDown);
        return;
      }

      this.removeEventListener("keydown", this.onKeyDown);
      this.tabIndex = -1;
      this.root.tabIndex = -1;
      // this.focusTrap.deactivate(this);
      this.backdrop.classList.remove("visible");
      this.content.classList.remove("open");
      this.root.classList.remove("darken-background");
      this.root.classList.add("pointer-events-none");
    }
  }

  customElements.define("bottom-drawer", BottomDrawer);
}
