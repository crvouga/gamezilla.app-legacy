import { transitionSub, TransitionProps } from "./transition-shared";

declare global {
  namespace infero.createElement.JSX {
    interface IntrinsicElements {
      "transition-element": {
        id: string;
        children: unknown;
      };
    }
  }
  namespace JSX {
    interface IntrinsicElements {
      "transition-element": {
        id: string;
        children: unknown;
      };
    }
  }
}

if (typeof window !== "undefined" && "customElements" in window) {
  class Transition extends HTMLElement {
    observer: MutationObserver;
    unsubscribe: () => void;
    props: TransitionProps;
    enterQueue: Array<Node> = [];
    activeExits: number = 0;

    constructor() {
      super();
      this.observer = new MutationObserver(this.onMutations.bind(this));
      this.unsubscribe = () => {};
      this.props = {
        id: this.getAttribute("id") || "",
        onEnter: async () => {},
        onExit: async () => {},
        className: "",
        mode: "in-out",
      };
    }

    connectedCallback() {
      this.observer.observe(this, { childList: true });
      this.unsubscribe = transitionSub.subscribe((msgEvt) => {
        if (msgEvt.id === this.getAttribute("id")) {
          this.props = msgEvt;
          this.syncUI();
        }
      });

      if (this.props.appear) {
        Array.from(this.childNodes).forEach((child) => {
          if (child instanceof HTMLElement) {
            this.applyTransition(child, "enter");
          }
        });
      }
    }

    syncUI() {
      this.className = this.props.className ?? "";
    }

    disconnectedCallback() {
      this.observer.disconnect();
      this.unsubscribe();
    }

    onMutations(mutationsList: MutationRecord[], _observer: MutationObserver) {
      switch (this.props.mode) {
        case "in-out": {
          mutationsList.forEach((mutation) => {
            if (mutation.type === "childList") {
              mutation.addedNodes.forEach((node) =>
                this.applyTransition(node, "enter")
              );
              mutation.removedNodes.forEach((node) =>
                this.applyTransition(node, "exit")
              );
            }
          });
          break;
        }
        case "out-in": {
          mutationsList.forEach((mutation) => {
            if (mutation.type === "childList") {
              mutation.removedNodes.forEach((node) => {
                this.applyTransition(node, "exit");
              });

              mutation.addedNodes.forEach((node) => {
                if (node instanceof HTMLElement) {
                  node.style.visibility = "hidden";
                }
                this.enterQueue.push(node);
              });
            }
          });

          if (this.activeExits === 0) {
            this.processEnterQueue();
          }
          break;
        }
      }
    }

    override removeChild<T extends Node>(node: T): T {
      this.applyTransition(node, "exit").then(() => {
        if (node.parentNode === this) {
          super.removeChild(node);
        }
      });
      return node;
    }

    async applyTransition(node: Node, type: "enter" | "exit"): Promise<void> {
      if (!(node instanceof HTMLElement)) {
        return;
      }

      if (type === "exit") {
        this.activeExits++;
      }

      try {
        if (type === "enter") {
          node.style.visibility = "visible";
          await this.props.onEnter?.(node);
        } else {
          await this.props.onExit?.(node);
        }
      } finally {
        if (type === "exit") {
          this.activeExits--;
          if (this.activeExits === 0) {
            this.processEnterQueue();
          }
        }
      }
    }

    processEnterQueue() {
      while (this.enterQueue.length > 0) {
        const node = this.enterQueue.shift();
        if (node) {
          this.applyTransition(node, "enter");
        }
      }
    }
  }

  customElements.define("transition-element", Transition);
}
