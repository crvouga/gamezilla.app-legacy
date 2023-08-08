import { Chess } from "chess.js";
import "chessboard-element"; // https://justinfagnani.github.io/chessboard-element/docs/
import { ChessBoardElement } from "chessboard-element";
import { Square, isLowercaseSquare } from "../../../chess";
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
      source: Square;
      target: Square;
      setAction: (action: "snapback" | "idl") => void;
    }
  | {
      t: "mouseover-square";
      square: Square;
      piece: string;
    }
  | {
      t: "mouseout-square";
    }
  | {
      t: "snap-end";
    }
  | {
      t: "drag-start";
      source: Square;
      piece: string;
      position: string;
      orientation: "white" | "black";
    };

type Msg = BoardMsg;

class ChessBoard extends HTMLElement {
  private props: ChessboardProps | null = null;
  private unsubscribe: () => void = () => {};

  private game = new Chess();
  private root: ShadowRoot;
  private highlightStyles = document.createElement("style");

  constructor() {
    super();
    this.root = this.attachShadow({ mode: "open" });
  }

  log(...args: any[]) {
    const debug = true;
    if (debug) {
      console.log(`[chess-board]`, ...args);
    }
  }

  disconnectedCallback() {
    this.teardown();
  }

  connectedCallback() {
    this.setup();
  }

  teardown() {
    this.unsubscribe();
  }

  dispatch(msg: Msg) {
    this.log(msg);
    switch (msg.t) {
      case "drop": {
        this.removeSquareHighlight();
        const { source, target, setAction } = msg;

        const isValidDrop = this.props?.onPieceDrop?.({
          source: source,
          target: target,
        });

        this.log("isValidDrop", isValidDrop);

        if (!isValidDrop) {
          setAction("snapback");
          return;
        }
        return;
      }

      case "mouseout-square": {
        this.removeSquareHighlight();
        return;
      }

      case "drag-start": {
        this.addSquareHighlight(msg.source);
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

        this.addSquareHighlight(square);

        for (const move of moves) {
          this.addSquareHighlight(move.to);
        }
        return;
      }
      case "snap-end": {
        const board = this.root.querySelector(
          "chess-board"
        ) as ChessBoardElement;
        board.setPosition(this.game.fen());
        return;
      }
    }
  }

  removeSquareHighlight() {
    this.highlightStyles.textContent = "";
  }

  addSquareHighlight(square: string | undefined) {
    if (!square) {
      return;
    }
    this.log(`addSquareHighlight`, square);
    const sqr = square.toUpperCase();
    const whiteSquareGrey = "#a9a9a9";
    const blackSquareGrey = "#696969";
    const highlightColor =
      sqr.charCodeAt(0) % 2 ^ sqr.charCodeAt(1) % 2
        ? whiteSquareGrey
        : blackSquareGrey;

    this.highlightStyles.textContent += `
        chess-board::part(${sqr}) {
          background-color: ${highlightColor};
        }
      `;
  }

  setup() {
    this.unsubscribe = chessboardSub.subscribe((event) => {
      if (event.id === this.getAttribute("id")) {
        this.props = event;
        // this.log(`props`, event);
        this.sync();
      }
    });

    this.root.innerHTML = `
      <style>
        :host {
          display: block;
          width: 100%;
          height: 100%;
          overflow: hidden;
        }
      </style>
      <chess-board id="board"></chess-board>
    `;

    this.root.appendChild(this.highlightStyles);

    const board = this.root.querySelector("chess-board") as ChessBoardElement;

    board.addEventListener(
      "drop",
      (e) => {
        // @ts-ignore
        const { source, target, setAction } = e.detail;
        this.dispatch({ t: "drop", setAction, source, target });
      },
      { passive: true }
    );

    board.addEventListener(
      "mouseover-square",
      (e) => {
        // @ts-ignore
        const { square, piece } = e.detail;
        this.dispatch({ t: "mouseover-square", square, piece });
      },
      { passive: true }
    );

    board.addEventListener(
      "mouseout-square",
      () => {
        this.dispatch({ t: "mouseout-square" });
      },
      { passive: true }
    );

    board.addEventListener(
      "snap-end",
      () => {
        this.dispatch({ t: "snap-end" });
      },
      { passive: true }
    );

    board.addEventListener(
      "drag-start",
      (e) => {
        // @ts-ignore
        const { source, piece, position, orientation } = e.detail;

        if (
          this.props?.isPieceDraggable &&
          !this.props.isPieceDraggable({ piece, square: source })
        ) {
          e.preventDefault();

          this.log(`drag-start prevented`);
          return;
        }

        this.dispatch({
          t: "drag-start",
          source,
          piece,
          position,
          orientation,
        });
      },
      { passive: true }
    );

    this.sync();
  }

  /**
   * Syncs the board and internal state with the props.
   */
  sync() {
    const board = this.root.querySelector("chess-board") as ChessBoardElement;

    const fen = this.props?.fen;
    if (typeof fen === "string") {
      board.setPosition(fen, true);
      this.game.load(fen);
    }

    board.orientation = this.props?.orientation === "w" ? "white" : "black";
    board.draggablePieces = true;
  }
}

customElements.define("my-chess-board", ChessBoard);
