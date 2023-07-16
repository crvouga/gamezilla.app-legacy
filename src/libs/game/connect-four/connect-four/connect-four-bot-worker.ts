import { Minimax, MinimaxConfig } from "@gamezilla/shared/app";
import {
  COLUMN_COUNT,
  Columns,
  MAX_COLUMN_HEIGHT,
  PlayerType,
  opposite,
  toStatus,
} from "./connect-four";

type State = {
  columns: Columns;
  lastMoveColumnIndex: number | null;
  turn: PlayerType;
};

const yieldChildren: MinimaxConfig<State>["yieldChildren"] = function* (state) {
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

    yield {
      columns: copied,
      turn: opposite[state.turn],
      lastMoveColumnIndex: columnIndex,
    };
  }
};

const findBestMove = ({
  maximizingPlayer,
}: {
  maximizingPlayer: PlayerType;
}): {
  columnIndex: number | null;
} => {
  const config: MinimaxConfig<State> = {
    yieldChildren,
    toScore: (ctx, state) => {
      // TODO: this is too slow
      const status = toStatus(state.columns);

      if (status.type === "Winner") {
        if (status.winner === maximizingPlayer) {
          return 22 - ctx.depth;
        }
        return -22 + ctx.depth;
      }

      if (status.type === "Tie") {
        return 0;
      }

      return 0;
    },
  };

  const bestState = Minimax.findBestChildState({
    config,
    depth: 5,
    state: {
      columns: Array.from({ length: COLUMN_COUNT }, () => []),
      turn: maximizingPlayer,
      lastMoveColumnIndex: null,
    },
  });

  const bestMove = bestState?.lastMoveColumnIndex ?? null;

  return {
    columnIndex: bestMove,
  };
};

export const ConnectFourBotWorker = {
  findBestMove,
};

export type ConnectFourBotWorker = typeof ConnectFourBotWorker;
