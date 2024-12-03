import type { VDom } from '~/@/vdom'
import { TranslatedText } from '~/@/l18n'
import { SpaceClientCtx } from '~/app/spaces/@/space-client-ctx'

export type PlayerType = 'player-one' | 'player-two'

export type VsBotInput = {
  ctx: SpaceClientCtx
  title: TranslatedText
  renderCoverArt: (input: { className: string }) => VDom
  onQuit: () => void
  onStartGame: () => void
  onSwapSides: () => void
  bot: {
    label: TranslatedText
    renderIcon: (input: { className: string }) => VDom
  }
  playerOne: {
    label: TranslatedText
    renderIcon: (input: { className: string }) => VDom
    onStartPlaying: () => void
    onStopPlaying: () => void
  }
  playerTwo: {
    label: TranslatedText
    renderIcon: (input: { className: string }) => VDom
    onStartPlaying: () => void
    onStopPlaying: () => void
  }
  botVariants: {
    label: TranslatedText
    renderIcon: (input: { className: string }) => VDom
    onSelect: () => void
  }[]
}
