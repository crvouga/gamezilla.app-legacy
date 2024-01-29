import {
  IntersectionObserverEmitterProps,
  sub,
} from "./intersection-observer-shared";

declare global {
  namespace inferno.createElement.JSX {
    interface IntrinsicElements {
      "intersection-observer-dispatchter": {
        id: string;
      };
    }
  }
  namespace JSX {
    interface IntrinsicElements {
      "intersection-observer-dispatchter": {
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
    private queue: IntersectionObserverEntry[] = [];

    constructor() {
      super();

      this.attachShadow({ mode: "open" });
      this.intersectionObserver = new IntersectionObserver(
        this.onIntersection,
        {
          rootMargin: "0px",
          threshold: 1.0,
        }
      );
    }

    connectedCallback() {
      this.unsubscribe = sub.subscribe((msgEvent) => {
        if (msgEvent.props.id !== this.getAttribute("id")) {
          return;
        }
        this.props = msgEvent.props;

        if (this.queue.length > 0) {
          this.onIntersection(this.queue);
          this.queue = [];
        }
      });

      this.intersectionObserver.observe(this);
    }

    disconnectedCallback() {
      this.intersectionObserver.disconnect();
      this.unsubscribe();
    }

    private onIntersection = (entries: IntersectionObserverEntry[]) => {
      if (typeof this.props?.onVisible !== "function") {
        this.queue.push(...entries);
        return;
      }
      this.props.onVisible();
    };
  }

  customElements.define(
    "intersection-observer-dispatchter",
    IntersectionObserverEmitter
  );
}
