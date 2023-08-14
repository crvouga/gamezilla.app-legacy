const src = {
  captureSound: "./space-game-chess/capture-1.wav",
  castlingSound: "./space-game-chess/castling-1.wav",
  checkSound: "./space-game-chess/check-1.wav",
  gameOverSound: "./space-game-chess/game-over.wav",
  gameStartSound: "./space-game-chess/game-start.wav",
  moveSound: "./space-game-chess/move-1.wav",
  navigationCancelSound: "./space-game-chess/navigation-cancel.wav",
  navigationForwardSelectionSound:
    "./space-game-chess/navigation_forward-selection-minimal.wav",
  uiUnlockSound: "./space-game-chess/ui_unlock.wav",
} as const;

if (typeof window === "undefined") {
  // @ts-ignore
  global.Audio = class Audio {
    constructor() {}
    play() {}
  };
}

export const ChessSounds = {
  capture: new Audio(src.captureSound),
  castling: new Audio(src.castlingSound),
  check: new Audio(src.checkSound),
  gameOver: new Audio(src.gameOverSound),
  gameStart: new Audio(src.gameStartSound),
  move: new Audio(src.moveSound),
  navigationCancel: new Audio(src.navigationCancelSound),
  navigationForwardSelection: new Audio(src.navigationForwardSelectionSound),
  uiUnlock: new Audio(src.uiUnlockSound),
};
