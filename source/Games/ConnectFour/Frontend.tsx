import { Cmd } from "../../Core"
import * as Route from "../../Route"
import * as UI from "../../UI"
import * as Columns from "./Columns"

//
//
//
// Model
//
//
//

export type Model = {
  columns: Columns.Columns
}

export const init: Model = {
  columns: Columns.emptyColumns,
}

//
//
//
// Update
//
//
//

export type Msg =
  | ["ClickedBack"]
  | ["ClickedBoard", { columnIndex: number }]
  | ["ClickedRestart"]

export const update = (msg: Msg, model: Model): [Model, Cmd.Cmd<Msg>] => {
  switch (msg[0]) {
    case "ClickedBack":
      return [model, Route.back]

    case "ClickedBoard":
      return [model, Cmd.None]

    case "ClickedRestart":
      return [model, Cmd.None]
  }
}

//
//
//
//
// View
//
//
//
//

export const theme = {
  primary: {
    light: "#1976D2",
    dark: "#2195F2",
    darker: "#0D47A1",
  },
  playerOne: {
    light: "#FFB74D",
    dark: "#FFA623",
  },
  playerTwo: {
    light: "#F24237",
    dark: "#DB332F",
  },
}

export const view =
  (model: Model): UI.View<Msg> =>
  (dispatch) =>
    (
      <UI.FillBox>
        <UI.Header
          left={
            <UI.HeaderBackButton onClick={() => dispatch(["ClickedBack"])} />
          }
          title={`${Columns.toTurn(model.columns)}'s turn`}
        />
        <Board
          columns={model.columns}
          onClick={(columnIndex) =>
            dispatch([
              "ClickedBoard",
              {
                columnIndex,
              },
            ])
          }
        />
        <UI.Button
          fullWidth
          size="large"
          onClick={() => dispatch(["ClickedRestart"])}
        >
          Restart
        </UI.Button>
      </UI.FillBox>
    )

const Board = ({
  columns,
  onClick,
}: {
  columns: Columns.Columns
  onClick: (columnIndex: number) => void
}) => {
  const ids = {
    playerOneGradient: "playerOneGradient",
    playerTwoGradient: "playerTwoGradient",
    holePattern: "holePattern",
    columnGradient: "columnGradient",
    holeMask: "holeMask",
  }

  const playerOneFill = `url(#${ids.playerOneGradient})`
  const playerTwoFill = `url(#${ids.playerTwoGradient})`

  return (
    <svg
      width="100%"
      viewBox={"0 0 7 6"}
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
            width={Columns.COLUMN_COUNT}
            height={Columns.MAX_COLUMN_HEIGHT}
            fill="white"
          ></rect>
          <rect
            x={0}
            y={0}
            width={Columns.COLUMN_COUNT}
            height={Columns.MAX_COLUMN_HEIGHT}
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
        width={7}
        height={6}
        fill={theme.primary.darker}
      />

      {columns.map((column, columnIndex) =>
        column.map((player, rowIndex) => (
          <circle
            key={[columnIndex, rowIndex].join(", ")}
            cx={columnIndex + 0.5}
            cy={Columns.MAX_COLUMN_HEIGHT - (rowIndex + 0.5)}
            r={0.5}
            fill={player === "PlayerOne" ? playerOneFill : playerTwoFill}
          />
        )),
      )}

      <rect
        x={0}
        y={0}
        width={Columns.COLUMN_COUNT}
        height={Columns.MAX_COLUMN_HEIGHT}
        fill={`url(#${ids.columnGradient})`}
        mask={`url(#${ids.holeMask})`}
      />

      {[...new Array(Columns.COLUMN_COUNT)].map((_, columnIndex) => (
        <rect
          style={{
            cursor:
              (columns[columnIndex]?.length ?? 0) >= Columns.MAX_COLUMN_HEIGHT
                ? "not-allowed"
                : "pointer",
          }}
          onClick={() => onClick(columnIndex)}
          key={columnIndex}
          x={columnIndex}
          y={0}
          width={1}
          height={Columns.MAX_COLUMN_HEIGHT}
          fill="transparent"
        />
      ))}
    </svg>
  )
}

//
//
//
//
// Cover Art
//
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
            width={Columns.COLUMN_COUNT}
            height={Columns.MAX_COLUMN_HEIGHT}
            fill="white"
          ></rect>
          <rect
            x={0}
            y={0}
            width={Columns.COLUMN_COUNT}
            height={Columns.MAX_COLUMN_HEIGHT}
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
        width={Columns.COLUMN_COUNT}
        height={Columns.MAX_COLUMN_HEIGHT}
        fill={`url(#${ids.columnGradient})`}
        mask={`url(#${ids.holeMask})`}
      />
    </svg>
  )
}
