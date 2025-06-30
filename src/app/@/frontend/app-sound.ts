import { Sound } from '~/@/sound/sound'

export const APP_SOUND = {
  tap: Sound.init('./sound/tap.wav', 'interaction.tap'),
  alertErrorLg: Sound.init('./sound/alert-error-lg.wav', 'feedback.negative'),
  alertErrorMd: Sound.init('./sound/alert-error-md.wav', 'feedback.negative'),
  alertErrorSm: Sound.init('./sound/alert-error-sm.wav', 'feedback.negative'),
  celebration: Sound.init('./sound/celebration.wav', 'feedback.positive'),
  celebrationDecorative: Sound.init('./sound/celebration-decorative.wav', 'feedback.positive'),
  navForward: Sound.init('./sound/nav-forward.wav', 'interaction.navigate'),
  navBackward: Sound.init('./sound/nav-backward.wav', 'interaction.navigate'),
  navForwardMin: Sound.init('./sound/nav-forward-min.wav', 'interaction.navigate'),
  navBackwardMin: Sound.init('./sound/nav-backward-min.wav', 'interaction.navigate'),
  navTransitionLeft: Sound.init('./sound/nav-transition-left.wav', 'interaction.navigate'),
  stateChangeUp: Sound.init('./sound/state-change-up.wav', 'interaction.navigate'),
  stateChangeDown: Sound.init('./sound/state-change-down.wav', 'interaction.navigate'),
  refreshFeed: Sound.init('./sound/refresh-feed.wav', 'interaction.navigate'),
  surfaceOpened: Sound.init('./sound/drawer-opened.wav', 'interaction.navigate'),
  surfaceClosed: Sound.init('./sound/drawer-closed.wav', 'interaction.navigate'),
} as const
