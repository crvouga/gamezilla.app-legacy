declare global {
  namespace JSX {
    interface IntrinsicElements {
      "my-bottom-drawer": {
        open: boolean;
        onClose: () => void;
        children: any;
      };
    }
  }
}

export class BottomDrawer extends HTMLElement {
  private backdrop: HTMLElement | null = null;
  private content: HTMLElement | null = null;
  private root: HTMLElement | null = null;

  static get observedAttributes() {
    return ["open", "onClose"];
  }

  constructor() {
    super();

    this.attachShadow({ mode: "open" });
  }

  disconnectedCallback() {
    console.log("disconnectedCallback");
  }

  connectedCallback() {
    console.log("connectedCallback");
    console.log(this.attributes);

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
        }
        .content {
          transition: transform 0.2s ease-in-out;
          transform: translateY(100%);
        }
        .backdrop {
          flex: 1;
          width: 100%;
          background-color: rgba(0, 0, 0, 0.5);
          transition: opacity 0.3s ease-in-out;
          opacity: 0;
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
      console.log("backdrop click", "onClose");
    });
  }

  attributeChangedCallback(name: string, _oldValue: string, newValue: string) {
    console.log("attributeChangedCallback", name, newValue);
    if (name === "open" && this.content && this.root && this.backdrop) {
      console.log(this.content);
      const isOpen = newValue === "true";
      if (isOpen) {
        this.content.classList.add("open");
        this.root.classList.remove("pointer-events-none");
        this.backdrop.classList.add("visible");
        return;
      }
      this.backdrop.classList.remove("visible");
      this.content.classList.remove("open");
      this.root.classList.add("pointer-events-none");
    }
  }
}

customElements.define("my-bottom-drawer", BottomDrawer);
