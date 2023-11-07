import { ok, Result } from "gamezilla/@SHARED/core";
import {
  ChildrenFn,
  Minimax,
  ScoreFn,
} from "gamezilla/app/space/@CHILD/game/@SHARED";
import {
  Columns,
  MAX_COLUMN_HEIGHT,
  PlayerType,
  opposite,
  toStatus,
} from "./connect-four";

export type BestMoveProblem = "no_move_available";

export type BestMoveResult = Result<
  BestMoveProblem,
  { columnIndex: number | null }
>;

type State = {
  columns: Columns;
  lastMoveColumnIndex: number | null;
  turn: PlayerType;
};

const COLUMN_INDEX_ORDER = [3, 4, 2, 5, 1, 6, 0];

export const findBestMove = ({
  maximizingPlayer,
  columns,
  maxDepth,
}: {
  maxDepth: number;
  maximizingPlayer: PlayerType;
  columns: Columns;
}): BestMoveResult => {
  const childrenFn: ChildrenFn<State> = (state) => {
    const children: State[] = [];

    for (const columnIndex of COLUMN_INDEX_ORDER) {
      const column = state.columns[columnIndex];

      if (!column) {
        continue;
      }

      if (column.length >= MAX_COLUMN_HEIGHT) {
        continue;
      }

      const columnsNew: Columns = state.columns.map((column) =>
        column.map((slot) => slot)
      );

      columnsNew[columnIndex] = [...column, state.turn];

      children.push({
        columns: columnsNew,
        turn: opposite[state.turn],
        lastMoveColumnIndex: columnIndex,
      });
    }

    return children;
  };

  const scoreFn: ScoreFn<State> = (state) => {
    const status = toStatus(state.columns);

    if (status.type !== "Winner") {
      return 0;
    }

    if (status.winner !== maximizingPlayer) {
      return Infinity;
    }

    return -Infinity;
  };

  const bestChildState = Minimax.findBestChildState({
    scoreFn,
    childrenFn,
    maxDepth,
    parentState: {
      columns,
      turn: maximizingPlayer,
      lastMoveColumnIndex: null,
    },
  });

  const bestMove = bestChildState?.lastMoveColumnIndex ?? null;

  return ok({
    columnIndex: bestMove,
  });
};

export const ConnectFourBotWorker = {
  findBestMove,
};

export type ConnectFourBotWorker = typeof ConnectFourBotWorker;
