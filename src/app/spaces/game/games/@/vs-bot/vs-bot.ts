import type { VDom } from '~/@/vdom/vdom'
import { TranslatedText } from '~/@/l18n'
import { SpaceFrontendCtx } from '~/app/spaces/@/frontend/ctx'

export type PlayerType = 'player-one' | 'player-two'

export type VsBotInput = {
  ctx: SpaceFrontendCtx
  title: TranslatedText
  renderCoverArt: (input: { class: string }) => VDom
  onQuit: () => void
  onStartGame: () => void
  onSwapSides: () => void
  bot: {
    label: TranslatedText
    renderIcon: (input: { class: string }) => VDom
  }
  playerOne: {
    label: TranslatedText
    renderIcon: (input: { class: string }) => VDom
    onStartPlaying: () => void
    onStopPlaying: () => void
  }
  playerTwo: {
    label: TranslatedText
    renderIcon: (input: { class: string }) => VDom
    onStartPlaying: () => void
    onStopPlaying: () => void
  }
  botVariants: {
    label: TranslatedText
    renderIcon: (input: { class: string }) => VDom
    onSelect: () => void
  }[]
}
