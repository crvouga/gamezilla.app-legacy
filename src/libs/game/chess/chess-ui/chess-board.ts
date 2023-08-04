import "chessboard-element"; // https://justinfagnani.github.io/chessboard-element/docs/

declare global {
  namespace JSX {
    interface IntrinsicElements {
      "my-chess-board": {
        fen: string;
        position?: "start";
        "draggable-pieces"?: boolean;
      };
    }
  }
}

type Attributes = {
  fen: string;
  "draggable-pieces"?: boolean;
};

type LibraryAttributes = {
  position?: "start" | string;
  "draggable-pieces"?: boolean;
};

const attrToLibAttr = (attr: Attributes): LibraryAttributes => {
  return {
    position: attr.fen,
    "draggable-pieces": attr["draggable-pieces"],
  };
};

export class ChessBoard extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
  }

  connectedCallback() {
    if (!this.shadowRoot) {
      return;
    }

    const attributes: Attributes = {
      fen: "",
      "draggable-pieces": true,
    };

    for (let i = 0; i < this.attributes.length; i++) {
      const attr = this.attributes.item(i);
      if (!attr) {
        continue;
      }
      if (attr.name === "fen" && typeof attr.value === "string") {
        attributes[attr.name] = attr.value;
        continue;
      }
      if (attr.name === "draggable-pieces" && typeof attr.value === "boolean") {
        attributes[attr.name] = attr.value;
        continue;
      }
    }

    console.log(attributes);

    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: block;
          width: 100%;
          height: 100%;
        }
      </style>
      <div style="width: 100%; height: 100%;">
        <chess-board ${objectToHtmlAttributes(
          attrToLibAttr(attributes)
        )}></chess-board>
      </div>`;
  }

  static get observedAttributes() {
    return ["message"];
  }

  attributeChangedCallback(name: string, _oldValue: string, _newValue: string) {
    if (name === "message") {
      this.connectedCallback();
    }
  }
}

customElements.define("my-chess-board", ChessBoard);

function objectToHtmlAttributes<T extends Record<string, unknown>>(
  obj: T
): string {
  let attrStr = "";
  for (let key in obj) {
    if (obj.hasOwnProperty(key)) {
      if (typeof obj[key] === "boolean") {
        if (obj[key]) {
          attrStr += ` ${key}`;
        }
      } else {
        attrStr += ` ${key}="${obj[key]}"`;
      }
    }
  }
  return attrStr;
}
