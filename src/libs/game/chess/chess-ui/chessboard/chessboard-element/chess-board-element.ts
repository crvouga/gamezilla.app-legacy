import "chessboard-element"; // https://justinfagnani.github.io/chessboard-element/docs/
import { ChessboardProps, chessboardSub } from "../chessboard-shared";

declare global {
  namespace JSX {
    interface IntrinsicElements {
      "my-chess-board": {
        id: string;
      };
    }
  }
}

class ChessBoard extends HTMLElement {
  private props: ChessboardProps | null = null;
  private unsubscribe: () => void = () => {};

  constructor() {
    super();
    this.attachShadow({ mode: "open" });
  }

  disconnectedCallback() {
    this.unsubscribe();
  }

  connectedCallback() {
    this.unsubscribe = chessboardSub.subscribe((event) => {
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
        :host {
          display: block;
          width: 100%;
          height: 100%;
        }
      </style>
      <div style="width: 100%; height: 100%;">
        <chess-board></chess-board>
      </div>`;

    this.syncUI();
  }

  syncUI() {
    const chessboard = this.shadowRoot?.querySelector("chess-board");
    if (!chessboard) {
      return;
    }
    chessboard.setAttribute("position", this.props?.fen ?? "");
    chessboard.setAttribute(
      "draggable-pieces",
      this.props?.["draggable-pieces"] ? "true" : "false"
    );
  }
}

customElements.define("my-chess-board", ChessBoard);
