import { Cmd } from "../../../Core"
import { UserId } from "../../../Data"
import * as Store from "../../../Store"
import * as UI from "../../../UI"
import { Position, Slot, theme, ViewBoard, ViewSlot } from "./TicTacToe"
import { FrontendModel, FrontendMsg, initSharedModel, ToFrontend } from "./TicTacToe.Types"

//
//
//
// Model
//
//
//

export type Model = FrontendModel

export const init = initSharedModel

//
//
// Update
//
//
//

export type Msg = FrontendMsg

export type OutAction = Store.Action

export const update = (
  { currentUserId }: { currentUserId: UserId.UserId },
  msg: Msg,
  model: Model,
): [Model, Cmd.Cmd<Msg>] => {
  return [model, Cmd.None]
}

export const updateFromBackend = (
  msg: ToFrontend,
  model: Model,
): [Model, Cmd.Cmd<Msg>,] => {
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
  (
    {
      currentUserId,
      store,
    }: {
      currentUserId: UserId.UserId
      store: Store.Model
    },
    model: Model,
  ): UI.View<Msg> =>
    (dispatch) => {
      return (
        <UI.FillBox>
          <ViewBoard
            board={model.board}
            onClick={() => { }}
          />
        </UI.FillBox>
      )
    }



export const CoverArt = () => {
  const positions: [Position, Slot][] = [
    [{ row: 0, column: 0 }, "X"],
    [{ row: 0, column: 1 }, "Empty"],
    [{ row: 1, column: 0 }, "Empty"],
    [{ row: 1, column: 1 }, "O"],
  ]

  const LINES = [
    { x1: 1, y1: 0, x2: 1, y2: 3 },
    { x1: 0, y1: 1, x2: 3, y2: 1 },
  ] as const

  return (
    <svg
      width="100%"
      viewBox="0 0 2 2"
    >
      <rect
        x={0}
        y={0}
        width={2}
        height={2}
        fill={theme.background}
      />

      {LINES.map((line, index) => (
        <line
          key={index}
          {...line}
          stroke={theme.line}
          strokeWidth={0.1}
        />
      ))}

      {positions.map(([{ column, row }, slot], index) => (
        <ViewSlot
          key={index}
          slot={slot}
          cx={Number(column) + 0.5}
          cy={Number(row) + 0.5}
          r={0.3}
        />
      ))}
    </svg>
  )
}