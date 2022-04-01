import { createAction } from "@reduxjs/toolkit";
import { InferActionMap, InferActionUnion } from "../../../utils";

type IPlayer = "X" | "O";

type ICell = IPlayer | "EMPTY";

type IColumn = {
  1: ICell;
  2: ICell;
  3: ICell;
};

type IBoard = {
  1: IColumn;
  2: IColumn;
  3: IColumn;
};

export type IState = {
  board: IBoard;

  players: {
    [player in IPlayer]:
      | {
          type: "user";
          userId: string;
        }
      | {
          type: "computer";
          diffculty: "Easy" | "Medium" | "Impossible";
        };
  };
};

const actions = {
  move: createAction<
    { type: "user"; userId: string; x: number; y: number },
    "tic-tac-toe/MOVE"
  >("tic-tac-toe/MOVE"),
};

type IAction = InferActionUnion<typeof actions>;

export const reducer = (state: IState, action: IAction): IState => {
  return state;
};
