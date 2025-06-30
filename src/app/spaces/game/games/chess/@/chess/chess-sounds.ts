import { Sound } from '~/@/sound/sound'

export const CHESS_SOUND = {
  captureSound: Sound.init('./space-game-chess/capture-1.wav', 'interaction.tap'),
  castlingSound: Sound.init('./space-game-chess/castling-1.wav', 'interaction.tap'),
  checkSound: Sound.init('./space-game-chess/check-1.wav', 'interaction.tap'),
  gameOverSound: Sound.init('./space-game-chess/game-over.wav', 'feedback.positive'),
  gameStartSound: Sound.init('./space-game-chess/game-start.wav', 'feedback.positive'),
  moveSound: Sound.init('./space-game-chess/move-1.wav', 'interaction.tap'),
  navigationCancelSound: Sound.init('./space-game-chess/navigation-cancel.wav', 'interaction.navigate'),
  navigationForwardSelectionSound: Sound.init(
    './space-game-chess/navigation_forward-selection-minimal.wav',
    'interaction.navigate',
  ),
  uiUnlockSound: Sound.init('./space-game-chess/ui_unlock.wav', 'interaction.navigate'),
} as const
