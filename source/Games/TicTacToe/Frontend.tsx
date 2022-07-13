import * as Route from "Route";
import * as UI from "UI";
import { Cmd } from "Core";
import * as Board from "./Board";
import { FrontendModel, FrontendMsg } from "./Types";

//
//
//
// Model
//
//
//

export type Model = FrontendModel;

export const init: Model = {
  rooms: {},
};

//
//
//
// Update
//
//
//

export type Msg = FrontendMsg;

export const update = (msg: Msg, model: Model): [Model, Cmd.Cmd<Msg>] => {
  switch (msg.type) {
    case "ClickedNewRoom":
      return [model, Cmd.None];

    case "ClickedBack":
      return [model, Route.back];
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
  (model: Model): UI.View<Msg> =>
  (dispatch) => {
    return (
      <UI.Page>
        <UI.Header
          left={
            <UI.HeaderBackButton
              onClick={() =>
                dispatch({ group: "TicTacToe", type: "ClickedBack" })
              }
            />
          }
          title="Tic Tac Toe"
        />

        <UI.Box sx={{ p: 2 }}>
          <UI.Button
            size="large"
            fullWidth
            onClick={() =>
              dispatch({ group: "TicTacToe", type: "ClickedNewRoom" })
            }
            variant="contained"
          >
            New Room
          </UI.Button>
        </UI.Box>
      </UI.Page>
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
