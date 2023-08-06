import { Chess } from "chess.js";
import "chessboard-element"; // https://justinfagnani.github.io/chessboard-element/docs/
import { ChessBoardElement } from "chessboard-element";
import { isLowercaseSquare } from "../../../chess";
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

type BoardMsg =
  | {
      t: "drop";
      source: string;
      target: string;
      setAction: (action: "snapback" | "idl") => void;
    }
  | {
      t: "mouseover-square";
      square: string;
      piece: string;
    }
  | {
      t: "mouseout-square";
    }
  | {
      t: "snap-end";
    };

type Msg = BoardMsg;

class ChessBoard extends HTMLElement {
  private props: ChessboardProps | null = null;
  private unsubscribe: () => void = () => {};
  private board = new ChessBoardElement();
  private game = new Chess();
  private root: ShadowRoot;
  private highlightStyles = document.createElement("style");

  constructor() {
    super();
    this.root = this.attachShadow({ mode: "open" });
  }

  log(...args: any[]) {
    console.log(`[ChessBoard]`, ...args);
  }

  disconnectedCallback() {
    this.cleanUp();
  }

  connectedCallback() {
    this.setup();
  }

  cleanUp() {
    this.unsubscribe();
  }

  dispatch(msg: Msg) {
    this.log(msg);
    switch (msg.t) {
      case "drop": {
        this.removeSquareHighlight();
        const { source, target, setAction } = msg;

        if (source === target) {
          setAction("snapback");
          return;
        }

        try {
          this.game.move({
            from: source.toLowerCase(),
            to: target.toLowerCase(),
          });
          return;
        } catch (error) {
          setAction("snapback");
          return;
        }
      }

      case "mouseout-square": {
        this.removeSquareHighlight();
        return;
      }

      case "mouseover-square": {
        const { square } = msg;

        if (!isLowercaseSquare(square)) {
          return;
        }

        const moves = this.game.moves({
          square: square,
          verbose: true,
        });

        if (moves.length === 0) {
          return;
        }

        this.addSquareHighlightSquare(square);

        for (const move of moves) {
          this.addSquareHighlightSquare(move.to);
        }
        return;
      }
      case "snap-end": {
        this.board.setPosition(this.game.fen());
        return;
      }
    }
  }

  removeSquareHighlight() {
    this.highlightStyles.textContent = "";
  }

  addSquareHighlightSquare(square: string) {
    const whiteSquareGrey = "#a9a9a9";
    const blackSquareGrey = "#696969";
    const highlightColor =
      square.charCodeAt(0) % 2 ^ square.charCodeAt(1) % 2
        ? whiteSquareGrey
        : blackSquareGrey;

    this.highlightStyles.textContent += `
        chess-board::part(${square}) {
          background-color: ${highlightColor};
        }
      `;
  }

  setup() {
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
    this.root.appendChild(this.board);
    this.root.appendChild(this.highlightStyles);

    this.board.addEventListener(
      "drop",
      (e) => {
        // @ts-ignore
        const { source, target, setAction } = e.detail;
        this.dispatch({ t: "drop", setAction, source, target });
      },
      { passive: true }
    );

    this.board.addEventListener(
      "mouseover-square",
      (e) => {
        // @ts-ignore
        const { square, piece } = e.detail;
        this.dispatch({ t: "mouseover-square", square, piece });
      },
      { passive: true }
    );

    this.board.addEventListener(
      "mouseout-square",
      () => {
        this.dispatch({ t: "mouseout-square" });
      },
      { passive: true }
    );

    this.board.addEventListener(
      "snap-end",
      () => {
        this.dispatch({ t: "snap-end" });
      },
      { passive: true }
    );

    this.sync();
  }

  sync() {
    const fen = this.props?.fen;
    if (typeof fen === "string") {
      this.board.setPosition(fen);
      this.game.load(fen);
    }

    this.board.setAttribute(
      "draggable-pieces",
      this.props?.["draggable-pieces"] ? "true" : "false"
    );
  }
}

customElements.define("my-chess-board", ChessBoard);
