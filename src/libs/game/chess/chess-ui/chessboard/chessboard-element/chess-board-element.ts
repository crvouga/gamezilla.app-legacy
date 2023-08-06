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
  private root: ShadowRoot;

  constructor() {
    super();
    this.root = this.attachShadow({ mode: "open" });
  }

  disconnectedCallback() {
    this.unsubscribe();
  }

  connectedCallback() {
    this.unsubscribe = chessboardSub.subscribe((event) => {
      if (event.id === this.getAttribute("id")) {
        this.props = event;
        this.sync();
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
    this.root.appendChild(rootStyle);
    this.root.appendChild(this.chessboard);
    this.sync();
  }

  sync() {
    const fen = this.props?.fen;
    if (typeof fen === "string") {
      this.chessboard.setPosition(fen);
    }

    this.chessboard.setAttribute(
      "draggable-pieces",
      this.props?.["draggable-pieces"] ? "true" : "false"
    );
  }
}

customElements.define("my-chess-board", ChessBoard);
