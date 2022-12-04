import { useRef } from "react"
import { Uuid } from "../../Core"
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
  const ref = useRef(Uuid.generateSync())
  return (
    <UI.SvgIcon viewBox="-1 -1 2 2" sx={{ ...sx }}>
      <ViewPlayerOneGradientDef
        cx={0}
        cy={0}
        r={1}
        gradientId={ref.current}
      />
      <circle cx={0} cy={0} r={1} fill={`url(#${ref.current})`} />
    </UI.SvgIcon>
  )
}

export const PlayerTwoIcon = ({ sx }: { sx?: UI.Sx }) => {
  const ref = useRef(Uuid.generateSync())
  return (
    <UI.SvgIcon viewBox="-1 -1 2 2" sx={{ ...sx }}>
      <ViewPlayerTwoGradientDef gradientId={ref.current} />
      <circle cx={0} cy={0} r={1} fill={`url(#${ref.current})`} />
    </UI.SvgIcon>
  )
}
