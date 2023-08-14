import captureSound from "./assets/capture-1.wav";
import castlingSound from "./assets/castling-1.wav";
import checkSound from "./assets/check-1.wav";
import gameOverSound from "./assets/game-over.wav";
import gameStartSound from "./assets/game-start.wav";
import moveSound from "./assets/move-1.wav";
import navigationCancelSound from "./assets/navigation-cancel.wav";
import navigationForwardSelectionSound from "./assets/navigation_forward-selection-minimal.wav";
import uiUnlockSound from "./assets/ui_unlock.wav";

export const ChessSounds = {
  capture: new Audio(captureSound),
  castling: new Audio(castlingSound),
  check: new Audio(checkSound),
  gameOver: new Audio(gameOverSound),
  gameStart: new Audio(gameStartSound),
  move: new Audio(moveSound),
  navigationCancel: new Audio(navigationCancelSound),
  navigationForwardSelection: new Audio(navigationForwardSelectionSound),
  uiUnlock: new Audio(uiUnlockSound),
};
