import {
  ChildrenFn,
  Minimax,
  ScoreFn,
} from "gamezilla/@CHILD/app/@CHILD/spaces/@CHILD/game/@SHARED/minimax";
import { Result } from "gamezilla/@SHARED/core";
import {
  Columns,
  MAX_COLUMN_HEIGHT,
  PlayerType,
  opposite,
  toStatus,
} from "./connect-four";

export type BestMoveProblem = "no_move_available";

export type BestMoveResult = Result<BestMoveProblem, number | null>;

type State = {
  columns: Columns;
  lastMoveColumnIndex: number | null;
  turn: PlayerType;
};

const COLUMN_INDEX_ORDER = [3, 4, 2, 5, 1, 6, 0];

const childrenFn: ChildrenFn<State> = (modelGame) => {
  const children: State[] = [];

  const turnNew = opposite[modelGame.turn];

  for (const columnIndex of COLUMN_INDEX_ORDER) {
    const column = modelGame.columns[columnIndex];

    if (!column) {
      continue;
    }

    if (column.length >= MAX_COLUMN_HEIGHT) {
      continue;
    }

    const copied: Columns = [
      ...modelGame.columns.slice(0, columnIndex),
      [...column, modelGame.turn],
      ...modelGame.columns.slice(columnIndex + 1),
    ];

    children.push({
      columns: copied,
      turn: turnNew,
      lastMoveColumnIndex: columnIndex,
    });
  }

  return children;
};

export const findBestMove = ({
  maximizingPlayer,
  columns,
  maxDepth,
}: {
  maxDepth: number;
  maximizingPlayer: PlayerType;
  columns: Columns;
}): {
  columnIndex: number | null;
} => {
  const scoreFn: ScoreFn<State> = (modelGame) => {
    const status = toStatus(modelGame.columns);

    if (status.type !== "Winner") {
      return 0;
    }

    if (status.winner !== maximizingPlayer) {
      return -Infinity;
    }

    return Infinity;
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

  return {
    columnIndex: bestMove,
  };
};

export const ConnectFourBotWorker = {
  findBestMove,
};

export type ConnectFourBotWorker = typeof ConnectFourBotWorker;
