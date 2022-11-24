import * as UI from "../../UI"
import {
  PlayerType,
  ViewPlayerOneGradientDef,
  ViewPlayerTwoGradientDef,
} from "./ConnectFour"

export const PlayerIcon = ({
  playerType,
  sx,
}: {
  playerType: PlayerType
  sx?: UI.Sx
}) => {
  switch (playerType) {
    case "PlayerOne": {
      return <PlayerOneIcon sx={sx} />
    }

    case "PlayerTwo": {
      return <PlayerTwoIcon sx={sx} />
    }
  }
}

export const PlayerOneIcon = ({ sx }: { sx?: UI.Sx }) => {
  return (
    <UI.SvgIcon
      viewBox="-1 -1 2 2"
      sx={{ ...sx }}
    >
      <ViewPlayerOneGradientDef
        gradientId="playerOneGradient"
        cx={0}
        cy={0}
        r={1}
      />
      <circle
        cx={0}
        cy={0}
        r={1}
        fill={`url(#playerOneGradient)`}
      />
    </UI.SvgIcon>
  )
}

export const PlayerTwoIcon = ({ sx }: { sx?: UI.Sx }) => {
  return (
    <UI.SvgIcon
      viewBox="-1 -1 2 2"
      sx={{ ...sx }}
    >
      <ViewPlayerTwoGradientDef gradientId="playerTwoGradient" />
      <circle
        cx={0}
        cy={0}
        r={1}
        fill={`url(#playerTwoGradient)`}
      />
    </UI.SvgIcon>
  )
}
