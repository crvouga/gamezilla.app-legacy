import { Cmd } from "../../Core"
import * as UI from "../../UI"
import {
  COLUMN_COUNT,
  MAX_COLUMN_HEIGHT,
  theme,
  ViewColumns
} from "./ConnectFour"
import {
  FrontendModel,
  FrontendMsg,
  initSharedModel,
  ToFrontend
} from "./ConnectFour.Types"

//
//
//
// Model
//
//
//

export type Model = FrontendModel

export const init: Model = initSharedModel

//
//
//
// Update
//
//
//

export type Msg = FrontendMsg

export const update = (msg: Msg, model: Model): [Model, Cmd.Cmd<Msg>] => {
  return [model, Cmd.None]
}

export const updateFromBackend = (
  msg: ToFrontend,
  model: Model,
): [Model, Cmd.Cmd<Msg>] => {
  return [model, Cmd.None]
}

//
//
//
// View
//
//
//

export const view =
  (model: Model): UI.View<Msg> =>
    (dispatch) =>
    (
      <UI.FillBox>
        <ViewColumns
          columns={model.columns}
          onClick={(columnIndex) => { }}
        />
      </UI.FillBox>
    )

//
//
//
// Cover Art
//
//
//

export const CoverArt = ({ id }: { id: string }) => {
  const ids = {
    playerOneGradient: `${id}-playerOneGradient`,
    playerTwoGradient: `${id}-playerTwoGradient`,
    holePattern: `${id}-holePattern`,
    columnGradient: `${id}-columnGradient`,
    holeMask: `${id}-holeMask`,
  }

  const playerOneFill = `url(#${ids.playerOneGradient})`
  const playerTwoFill = `url(#${ids.playerTwoGradient})`

  return (
    <svg
      width="100%"
      viewBox={"0 0 2 2"}
    >
      <defs>
        <pattern
          id={ids.holePattern}
          patternUnits="userSpaceOnUse"
          width={1}
          height={1}
        >
          <circle
            cx={0.5}
            cy={0.5}
            r={0.425}
            fill="black"
          ></circle>
        </pattern>

        <mask id={ids.holeMask}>
          <rect
            x={0}
            y={0}
            width={COLUMN_COUNT}
            height={MAX_COLUMN_HEIGHT}
            fill="white"
          ></rect>
          <rect
            x={0}
            y={0}
            width={COLUMN_COUNT}
            height={MAX_COLUMN_HEIGHT}
            fill={`url(#${ids.holePattern})`}
          ></rect>
        </mask>

        <linearGradient
          id={ids.columnGradient}
          gradientTransform="rotate(90)"
        >
          <stop
            offset="0%"
            stopColor={theme.primary.light}
          />
          <stop
            offset="100%"
            stopColor={theme.primary.dark}
          />
        </linearGradient>

        <linearGradient
          id={ids.playerOneGradient}
          gradientTransform="rotate(90)"
        >
          <stop
            offset="0%"
            stopColor={theme.playerOne.light}
          />
          <stop
            offset="100%"
            stopColor={theme.playerOne.dark}
          />
        </linearGradient>

        <linearGradient
          id={ids.playerTwoGradient}
          gradientTransform="rotate(90)"
        >
          <stop
            offset="0%"
            stopColor={theme.playerTwo.light}
          />
          <stop
            offset="100%"
            stopColor={theme.playerTwo.dark}
          />
        </linearGradient>
      </defs>

      <rect
        x={0}
        y={0}
        width={2}
        height={2}
        fill={theme.primary.darker}
      />

      <circle
        cx={0.5}
        cy={0}
        r={0.5}
        fill={playerOneFill}
      />

      <circle
        cx={1.5}
        cy={0.5}
        r={0.5}
        fill={playerTwoFill}
      />

      <circle
        cx={1.5}
        cy={1.5}
        r={0.5}
        fill={playerOneFill}
      />

      <circle
        cx={0.5}
        cy={1.5}
        r={0.5}
        fill={playerTwoFill}
      />

      <rect
        x={0}
        y={0}
        width={COLUMN_COUNT}
        height={MAX_COLUMN_HEIGHT}
        fill={`url(#${ids.columnGradient})`}
        mask={`url(#${ids.holeMask})`}
      />
    </svg>
  )
}
