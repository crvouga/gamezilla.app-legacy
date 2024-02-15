import { SpaceClientCtx } from "gamezilla/@CHILD/app/@CHILD/spaces/@SHARED/space"
import { VDom } from "gamezilla/@SHARED/vdom"

export type PlayerType = "player-one" | "player-two"

export type VsBotProps = {
  ctx: SpaceClientCtx
  title: string
  renderCoverArt: (props: { className: string }) => VDom
  onQuit: () => void
  onStartGame: () => void
  onSwapSides: () => void
  bot: {
    label: string
    renderIcon: (props: { className: string }) => VDom
  }
  playerOne: {
    label: string
    renderIcon: (props: { className: string }) => VDom
    onStartPlaying: () => void
    onStopPlaying: () => void
  }
  playerTwo: {
    label: string
    renderIcon: (props: { className: string }) => VDom
    onStartPlaying: () => void
    onStopPlaying: () => void
  }
  botVariants: {
    label: string
    renderIcon: (props: { className: string }) => VDom
    onSelect: () => void
  }[]
}
