import { Uuid } from "gamezilla-app/@shared/core"
import { PlayerType } from "../connect-four"
import { gameTheme } from "./shared"

export const PlayerIcon = ({
  playerType,
  ...props
}: {
  playerType: PlayerType
  key?: string
  className?: string
}) => {
  switch (playerType) {
    case "player-one": {
      return <PlayerOneIcon {...props} />
    }

    case "player-two": {
      return <PlayerTwoIcon {...props} />
    }
  }
}

export const ViewPlayerOneGradientDef = ({
  gradientId,
  cx,
  cy,
  r,
}: {
  gradientId: string
  cx: number
  cy: number
  r: number
}) => {
  return (
    <radialGradient
      id={gradientId}
      gradientTransform="rotate(90)"
      cx={cx}
      cy={cy}
      r={r}
    >
      <stop offset="50%" stopColor={gameTheme["player-one"].light} />
      <stop offset="100%" stopColor={gameTheme["player-one"].dark} />
    </radialGradient>
  )
}

export const ViewPlayerTwoGradientDef = ({
  gradientId,
}: {
  gradientId: string
}) => {
  return (
    <radialGradient id={gradientId} gradientTransform="rotate(90)">
      <stop offset="50%" stopColor={gameTheme["player-two"].light} />
      <stop offset="100%" stopColor={gameTheme["player-two"].dark} />
    </radialGradient>
  )
}

export const PlayerOneIcon = (props: { key?: string; className?: string }) => {
  const playerOneId = Uuid.generate()
  return (
    <svg viewBox="-1 -1 2 2" {...props}>
      <ViewPlayerOneGradientDef cx={0} cy={0} r={1} gradientId={playerOneId} />
      <circle cx={0} cy={0} r={1} fill={`url(#${playerOneId})`} />
    </svg>
  )
}

export const PlayerTwoIcon = (props: { key?: string; className?: string }) => {
  const playerTwoId = Uuid.generate()
  return (
    <svg viewBox="-1 -1 2 2" {...props}>
      <ViewPlayerTwoGradientDef gradientId={playerTwoId} />
      <circle cx={0} cy={0} r={1} fill={`url(#${playerTwoId})`} />
    </svg>
  )
}
