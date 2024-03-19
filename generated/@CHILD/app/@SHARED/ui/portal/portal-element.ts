declare global {
    namespace infero.createElement.JSX {
        interface IntrinsicElements {
            "portal-entrance": {
                "portial-id": string;
                children: unknown;
            };
            "portal-exit": {
                "portial-id": string;
            };
        }
    }
    namespace JSX {
        interface IntrinsicElements {
            "portal-entrance": {
                "portal-id": string;
                children: unknown;
            };
            "portal-exit": {
                "portal-id": string;
            };
        }
    }
}
if (typeof window !== "undefined") {
    //
    //
    //
    //
    //
    //
    const entrances = new Map<string, Set<HTMLElement>>();
    const exits = new Map<string, HTMLElement>();
    const registerEntrance = (id: string, element: HTMLElement) => {
        if (!entrances.has(id)) {
            entrances.set(id, new Set());
        }
        entrances.get(id)!.add(element);
        updatePortal(id);
    };
    const registerExit = (id: string, element: HTMLElement) => {
        exits.set(id, element);
        updatePortal(id);
    };
    const updatePortal = (id: string) => {
        const entranceSet = entrances.get(id);
        const exit = exits.get(id);
        if (entranceSet && exit) {
            // Clear existing content in exit
            while (exit.firstChild) {
                exit.removeChild(exit.firstChild);
            }
            // Aggregate and append children from all entrances to exit
            entranceSet.forEach((entrance) => {
                Array.from(entrance.childNodes).forEach((child) => {
                    exit.appendChild(child.cloneNode(true));
                });
            });
        }
    };
    //
    //
    //
    //
    //
    //
    class PortalEntrance extends HTMLElement {
        private observer: MutationObserver;
        constructor() {
            super();
            this.observer = new MutationObserver(() => {
                const id = this.getAttribute("portal-id");
                if (id) {
                    updatePortal(id);
                }
            });
            this.attachShadow({ mode: "open" });
        }
        connectedCallback() {
            this.observeChildChanges();
            this.updatePortalId();
        }
        // attributeChangedCallback() {
        //   this.updatePortalId();
        // }
        private observeChildChanges() {
            this.observer.observe(this, { childList: true });
        }
        private updatePortalId() {
            const id = this.getAttribute("portal-id");
            if (id) {
                this.observer.disconnect();
                registerEntrance(id, this);
                this.observeChildChanges();
            }
        }
    }
    customElements.define("portal-entrance", PortalEntrance);
    //
    //
    //
    //
    //
    //
    class PortalExit extends HTMLElement {
        static get observedAttributes() {
            return ["portal-id"];
        }
        constructor() {
            super();
        }
        connectedCallback() {
            this.updatePortalId();
        }
        attributeChangedCallback() {
            this.updatePortalId();
        }
        private updatePortalId() {
            const id = this.getAttribute("portal-id");
            if (id) {
                registerExit(id, this);
            }
        }
    }
    customElements.define("portal-exit", PortalExit);
    //
    //
    //
    //
    //
    //
}
