import { Result } from "@gamezilla/core";
import { ChildrenFn, Minimax, ScoreFn } from "@gamezilla/shared/app";
import {
  COLUMN_COUNT,
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

const childrenFn: ChildrenFn<State> = (state) => {
  const children: State[] = [];

  for (let columnIndex = 0; columnIndex < COLUMN_COUNT; columnIndex++) {
    const column = state.columns[columnIndex];

    if (!column) {
      continue;
    }

    if (column.length >= MAX_COLUMN_HEIGHT) {
      continue;
    }

    const copied: Columns = [
      ...state.columns.slice(0, columnIndex),
      [...column, state.turn],
      ...state.columns.slice(columnIndex + 1),
    ];

    children.push({
      columns: copied,
      turn: opposite[state.turn],
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
  const scoreFn: ScoreFn<State> = (ctx, state) => {
    const status = toStatus(state.columns);
    console.log(ctx.currentDepth, state);

    if (status.type === "Winner") {
      if (status.winner === maximizingPlayer) {
        return -22 + ctx.currentDepth;
      }
      return 22 - ctx.currentDepth;
    }

    if (status.type === "Tie") {
      return 0;
    }

    return 0;
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
