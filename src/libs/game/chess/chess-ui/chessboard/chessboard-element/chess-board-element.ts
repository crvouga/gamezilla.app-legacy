import "chessboard-element"; // https://justinfagnani.github.io/chessboard-element/docs/
import { ChessboardProps, chessboardSub } from "../chessboard-shared";
import { ChessBoardElement } from "chessboard-element";

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
  private chessboard = new ChessBoardElement();

  constructor() {
    super();
    const shadowRoot = this.attachShadow({ mode: "open" });
    this.unsubscribe = chessboardSub.subscribe((event) => {
      if (event.id === this.getAttribute("id")) {
        this.props = event;
        this.syncUI();
      }
    });

    const rootStyle = document.createElement("style");
    rootStyle.innerHTML = `
      :host {
        display: block;
        width: 100%;
        height: 100%;
        overflow: hidden;
      }
    `;
    shadowRoot.appendChild(rootStyle);
    shadowRoot.appendChild(this.chessboard);
    this.syncUI();
  }

  disconnectedCallback() {
    this.unsubscribe();
  }

  connectedCallback() {
    //
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
