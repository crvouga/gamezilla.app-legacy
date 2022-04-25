import { createAction } from "@reduxjs/toolkit";
import { InferActionUnion } from "../../utils";
import { emptyColumns, IColumns, move, toTurn } from "./connect-four-columns";

/*


state


*/

export type IState = {
  columns: IColumns;
};

export const initialState: IState = {
  columns: emptyColumns,
};

/*


actions


*/

export const actions = {
  columnsCleared: createAction("connect-four/COLUMNS_CLEARED"),

  columnPressed: createAction(
    "connect-four/COLUMN_PRESSED",
    (columnIndex: number) => ({
      payload: {
        columnIndex,
      },
    })
  ),
};

export type IAction = InferActionUnion<typeof actions>;

/*


reducer


*/

export const reducer = (state: IState, action: IAction): IState => {
  switch (action.type) {
    case "connect-four/COLUMNS_CLEARED":
      return {
        ...state,
        columns: emptyColumns,
      };

    case "connect-four/COLUMN_PRESSED":
      const { columnIndex } = action.payload;

      const turn = toTurn(state.columns);

      return {
        ...state,
        columns: move(state.columns, columnIndex, turn),
      };
  }
};

/*


middleware


*/

export function* saga() {}
