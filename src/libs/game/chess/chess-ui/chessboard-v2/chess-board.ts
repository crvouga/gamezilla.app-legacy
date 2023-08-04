class ChessBoard extends HTMLElement {
  connectedCallback() {
    this.innerHTML = `<p>This is my custom chess board!</p>`;
  }
}

customElements.define("chess-board", ChessBoard);
