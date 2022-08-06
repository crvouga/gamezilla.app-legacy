import { Cmd } from "../../Core"
import { UserId } from "../../Data"
import * as Store from "../../Store"
import * as UI from "../../UI"
import * as Board from "./Board"
import {
  FrontendModel,
  FrontendMsg,
  init as initModel,
  ToFrontend,
} from "./Types"

//
//
//
// Model
//
//
//

export type Model = FrontendModel

export const init: [Model, Cmd.Cmd<Msg>] = [initModel, Cmd.None]

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
): [Model, Cmd.Cmd<Msg>, OutAction[]] => {
  return [model, Cmd.None, []]
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
    }: { currentUserId: UserId.UserId; store: Store.Model },
    model: Model,
  ): UI.View<Msg> =>
  (dispatch) => {
    return <>tic tac toe view</>
  }

//
//
//
//
//
//
//

export const CoverArt = () => {
  const positions: [Board.Position, Board.Slot][] = [
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
      height="100%"
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

//
//
//
// View Board
//
//
//

export const theme = {
  background: "#14BDAC",
  line: "#0DA192",
  cross: "#545454",
  naught: "#F2EBD3",
}

export const ViewBoard = ({
  board,
  onClick,
}: {
  board: Board.Board
  onClick: (position: Board.Position) => void
}) => {
  return (
    <svg
      width={"100%"}
      viewBox="0 0 3 3"
    >
      <rect
        width="100%"
        height="100%"
        fill={theme.background}
      />
      {lines.map((line, index) => (
        <line
          key={index}
          x1={line.x1}
          y1={line.y1}
          x2={line.x2}
          y2={line.y2}
          stroke={theme.line}
          strokeWidth={0.1}
        />
      ))}
      {Board.allPositions.map((position) => (
        <ViewSlot
          key={[
            position.column,
            position.row,
            Board.toSlot(board, position),
          ].join(" ")}
          slot={Board.toSlot(board, position)}
          cx={Number(position.column) + 0.5}
          cy={Number(position.row) + 0.5}
          r={0.3}
        />
      ))}

      {Board.allPositions.map((position) => (
        <rect
          key={[
            position.column,
            position.row,
            Board.toSlot(board, position),
          ].join(" ")}
          x={Number(position.column)}
          y={Number(position.row)}
          width={1}
          height={1}
          onClick={() => onClick(position)}
          fill="transparent"
        />
      ))}
    </svg>
  )
}

const lines = [
  { x1: 1, y1: 0, x2: 1, y2: 3 },
  { x1: 2, y1: 0, x2: 2, y2: 3 },
  { x1: 0, y1: 1, x2: 3, y2: 1 },
  { x1: 0, y1: 2, x2: 3, y2: 2 },
]

export const ViewSlot = ({
  slot,
  cx,
  cy,
  r,
  color,
}: {
  color?: string
  slot: Board.Slot
  r: number
  cx: number
  cy: number
}) => {
  switch (slot) {
    case "Empty":
      return <g></g>

    case "O":
      return (
        <Naught
          color={color}
          r={r}
          cx={cx}
          cy={cy}
        />
      )

    case "X":
      return (
        <Cross
          color={color}
          r={r}
          cx={cx}
          cy={cy}
        />
      )
  }
}

const Cross = ({
  cx,
  cy,
  r,
  color = theme.cross,
  strokeWidth = 0.1,
}: {
  color?: string
  r: number
  cx: number
  cy: number
  strokeWidth?: number
}) => {
  return (
    <g
      strokeWidth={strokeWidth}
      stroke={color}
    >
      {/* direction: \ */}
      <line
        x1={cx - r}
        y1={cy - r}
        x2={cx + r}
        y2={cy + r}
      />
      {/* direction: / */}
      <line
        x1={cx + r}
        y1={cy - r}
        x2={cx - r}
        y2={cy + r}
      />
    </g>
  )
}

const Naught = ({
  cx,
  cy,
  r,
  color = theme.naught,
  strokeWidth = 0.1,
}: {
  color?: string
  strokeWidth?: number
  r: number
  cx: number
  cy: number
}) => {
  return (
    <circle
      r={r}
      cx={cx}
      cy={cy}
      stroke={color}
      strokeWidth={strokeWidth}
      fill="transparent"
    />
  )
}

const VersusScreen = ({ store }: { store: Store.Model }) => {
  const profileX = undefined

  const profileO = undefined

  return (
    <svg
      width="100%"
      viewBox="0 0 1 1"
    >
      <rect
        width="100%"
        height="100%"
        fill={theme.background}
      />

      <mask id="avatar">
        <rect
          x={0}
          y={0}
          width={1}
          height={1}
          fill="black"
        />
        <circle
          cx={0.5}
          cy={0.5}
          r={0.5}
          fill="white"
        />
      </mask>

      {profileX && (
        <>
          <Cross
            cx={0.15}
            cy={0.25}
            r={0.075}
            strokeWidth={0.05}
          />
          <SvgAvatar
            id="x-avatar"
            cx={0.4}
            cy={0.25}
            r={0.1}
            src={""}
          />
        </>
      )}

      {profileO && (
        <>
          <Naught
            cx={0.55}
            cy={0.75}
            r={0.075}
            strokeWidth={0.05}
          />
          <SvgAvatar
            id="o-avatar"
            cx={0.8}
            cy={0.75}
            r={0.1}
            src={""}
          />
        </>
      )}

      <line
        x1={0}
        y1={1}
        x2={1}
        y2={0}
        stroke={theme.line}
        strokeWidth={0.0333}
      />
      <circle
        cx={0.5}
        cy={0.5}
        r={0.1}
        fill={theme.line}
      />
      <text
        dominantBaseline={"middle"}
        textAnchor={"middle"}
        x={0.5}
        y={0.5}
        fontSize={0.15}
        fill={"#fff"}
        r={0.15}
      >
        vs
      </text>
    </svg>
  )
}

const SvgAvatar = ({
  id,
  src,
  cx,
  cy,
  r,
}: {
  id: string
  src: string
  cx: number
  cy: number
  r: number
}) => {
  return (
    <>
      <defs>
        <clipPath id={id}>
          <circle
            cx={cx}
            cy={cy}
            r={r}
            fill="#FFFFFF"
          />
        </clipPath>
      </defs>
      <image
        x={cx - r}
        y={cy - r}
        width={r * 2}
        height={r * 2}
        xlinkHref={src}
        href={src}
        clipPath={`url(#${id})`}
      />
    </>
  )
}
