import {
  IntersectionObserverEmitterProps,
  sub,
} from "./intersection-observer-shared";

declare global {
  namespace inferno.createElement.JSX {
    interface IntrinsicElements {
      "intersection-observer-emitter": {
        id: string;
      };
    }
  }
  namespace JSX {
    interface IntrinsicElements {
      "intersection-observer-emitter": {
        id: string;
      };
    }
  }
}
if (typeof window !== "undefined" && "customElements" in window) {
  class IntersectionObserverEmitter extends HTMLElement {
    private unsubscribe: () => void = () => {};
    private props: IntersectionObserverEmitterProps | null = null;
    private intersectionObserver: IntersectionObserver;

    constructor() {
      super();

      this.attachShadow({ mode: "open" });
      // Initialize the Intersection Observer with your desired options
      this.intersectionObserver = new IntersectionObserver(
        this.onIntersection,
        {}
      );
    }

    connectedCallback() {
      this.unsubscribe = sub.subscribe((event) => {
        if (event.props.id !== this.getAttribute("id")) {
          return;
        }
        this.props = event.props;
      });

      if (!this.shadowRoot) {
        return;
      }

      const childElement = document.createElement("div");
      this.shadowRoot.appendChild(childElement);
      this.intersectionObserver.observe(childElement);
    }

    disconnectedCallback() {
      this.intersectionObserver.disconnect();
      this.unsubscribe();
    }

    private onIntersection = (_entries: IntersectionObserverEntry[]) => {
      this.props?.onVisible?.();
    };
  }

  customElements.define(
    "intersection-observer-emitter",
    IntersectionObserverEmitter
  );
}
