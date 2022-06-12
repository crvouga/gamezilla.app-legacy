import { cmd } from "Framework";
import { Cmd } from "Framework/Cmd";
import * as Navigation from "Framework/Navigation";
import * as View from "View";
import * as Board from "./Board";

//
//
//
// Model
//
//
//

export type Model = {
  board: Board.Board;
};

export const init: Model = {
  board: Board.emptyBoard,
};

//
//
//
// Update
//
//
//

export type Msg =
  | { type: "UserClickedBackButton" }
  | { type: "UserClickedBoard"; position: Board.Position }
  | { type: "UserClickedRestartButton" };

export const update = (msg: Msg, model: Model): [Model, Cmd<Msg>] => {
  switch (msg.type) {
    case "UserClickedBackButton":
      return [model, Navigation.back()];

    case "UserClickedRestartButton":
      return [
        {
          ...model,
          board: Board.emptyBoard,
        },
        cmd.none,
      ];

    case "UserClickedBoard":
      return [
        {
          ...model,
          board: Board.move(
            model.board,
            Board.toTurn(model.board),
            msg.position
          ),
        },
        cmd.none,
      ];
  }
};

//
//
//
// View
//
//
//

export const view =
  (model: Model): View.View<Msg> =>
  (dispatch) => {
    const status = Board.toStatus(model.board);
    const title =
      status.type === "Turn"
        ? `${status.turn} Turn`
        : status.type === "Win"
        ? `${status.winner} Won`
        : "Tie";

    return (
      <View.Page>
        <View.Header
          left={
            <View.HeaderBackButton
              onClick={() => dispatch({ type: "UserClickedBackButton" })}
            />
          }
          title={title}
        />
        <Board.Board
          board={model.board}
          onClick={(position) =>
            dispatch({ type: "UserClickedBoard", position })
          }
        />
        <View.Button
          size="large"
          fullWidth
          onClick={() => dispatch({ type: "UserClickedRestartButton" })}
        >
          Restart
        </View.Button>
      </View.Page>
    );
  };

export const Icon = () => {
  const positions: [Board.Position, Board.Slot][] = [
    [{ row: 0, column: 0 }, "X"],
    [{ row: 0, column: 1 }, "Empty"],
    [{ row: 1, column: 0 }, "Empty"],
    [{ row: 1, column: 1 }, "O"],
  ];

  const LINES = [
    { x1: 1, y1: 0, x2: 1, y2: 3 },
    { x1: 0, y1: 1, x2: 3, y2: 1 },
  ] as const;

  return (
    <svg width="100%" height="100%" viewBox="0 0 2 2">
      <rect x={0} y={0} width={2} height={2} fill={Board.theme.background} />

      {LINES.map((line, index) => (
        <line
          key={index}
          {...line}
          stroke={Board.theme.line}
          strokeWidth={0.1}
        />
      ))}

      {positions.map(([{ column, row }, slot], index) => (
        <Board.Slot
          key={index}
          slot={slot}
          cx={Number(column) + 0.5}
          cy={Number(row) + 0.5}
          r={0.3}
        />
      ))}
    </svg>
  );
};
