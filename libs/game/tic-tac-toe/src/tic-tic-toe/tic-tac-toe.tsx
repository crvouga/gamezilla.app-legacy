import { memoize, Result, shuffle, Task } from '@gamezilla/shared/core';

const { Err, Ok } = Result;

//
//
//
// Model
//
//
//

export type PlayerType = 'X' | 'O';

export const playerTypes: { [playerType in PlayerType]: PlayerType } = {
  X: 'X',
  O: 'O',
};

export const toOpposite = (playerType: PlayerType): PlayerType => {
  switch (playerType) {
    case 'O': {
      return 'X';
    }

    case 'X': {
      return 'O';
    }
  }
};

type Empty = '_';

export const Empty: Empty = '_';

export type Slot = PlayerType | Empty;

export type Row = 0 | 1 | 2;

export type Column = 0 | 1 | 2;

export const MAX_X = 3;

export const MAX_Y = 3;

export type Board = [
  [Slot, Slot, Slot],
  [Slot, Slot, Slot],
  [Slot, Slot, Slot]
];

export const toChildren = (board: Board): Board[] => {
  const turn = toTurn(board);

  const boards: Board[] = [];

  for (const position of allPositions) {
    const result = move({ board, player: turn, position });

    if (result.t === 'ok') {
      boards.push(result.value);
    }
  }

  return boards;
};

export type BotLevel = 'Easy' | 'Medium' | 'Impossible';

export const botLevels: { [botLevel in BotLevel]: BotLevel } = {
  Easy: 'Easy',
  Medium: 'Medium',
  Impossible: 'Impossible',
};

export const toDepth = (botLevel: BotLevel): number => {
  switch (botLevel) {
    case 'Easy': {
      return 2;
    }
    case 'Medium': {
      return 3;
    }
    case 'Impossible': {
      return 6;
    }
  }
};

export const toScore = ({
  board,
  maximizingPlayer,
}: {
  board: Board;
  maximizingPlayer: PlayerType;
}): number => {
  const gameOver = toGameOver(board);

  switch (gameOver.type) {
    case 'none': {
      return 0;
    }

    case 'Tie': {
      return 0;
    }

    case 'Win': {
      if (gameOver.winner === maximizingPlayer) {
        return 2;
      }

      return -1;
    }
  }
};

export const toBestMove = ({
  // depth,
  maximizingPlayer,
  board,
}: {
  depth: number;
  maximizingPlayer: PlayerType;
  board: Board;
}): Result<ToBestMoveProblem, Position> => {
  for (const position of shuffle(String(Math.random()), allPositions)) {
    const moved = move({ board, player: maximizingPlayer, position });

    if (moved.t === 'ok') {
      return Ok(position);
    }
  }

  // const minimax = Minimax.create({
  //   toChildren,
  //   toScore: (board) => toScore({ board, maximizingPlayer }),
  // });

  // const bestMove = maxBy(allPositions, (position) => {
  //   const result = move({ board, player: maximizingPlayer, position });

  //   if (result.t === 'err') {
  //     return -Infinity;
  //   }

  //   const score = minimax({ state: result.value, depth });

  //   return score;
  // });

  return Err('no_valid_move');
};

export type ToBestMoveProblem = 'no_valid_move';

export const toBestMove_ = ({
  maximizingPlayer,
  board,
}: {
  depth: number;
  maximizingPlayer: PlayerType;
  board: Board;
}): Result<ToBestMoveProblem, Position> => {
  for (const position of allPositions) {
    const result = move({ board, player: maximizingPlayer, position });
    if (result.t === 'ok') {
      return Ok(position);
    }
  }

  return Err('no_valid_move');
};

export type Worker = {
  toBestMove: typeof toBestMove;
};

export type FindBestMoveProblem = 'worker_thread_error' | ToBestMoveProblem;

export type FindBestMoveResult = Result<FindBestMoveProblem, Position>;

export const findBestMove =
  ({
    board,
    depth,
    maximizingPlayer,
  }: {
    depth: number;
    maximizingPlayer: PlayerType;
    board: Board;
  }): Task<FindBestMoveResult> =>
  async () => {
    const result = toBestMove({ board, depth, maximizingPlayer });

    await new Promise((resolve) => setTimeout(resolve, 1000));

    return result;

    // try {
    //   // docs: https://threads.js.org/
    //   const worker = new Threads.Worker('./worker');

    //   const spawned = await Threads.spawn<Worker>(worker);

    //   try {
    //     const result = await spawned.toBestMove({
    //       depth,
    //       maximizingPlayer,
    //       board,
    //     });
    //     return result;
    //   } catch (error) {
    //     return Err('worker_thread_error');
    //   } finally {
    //     await Threads.Thread.terminate(spawned);
    //   }
    // } catch (error) {
    //   return Err('worker_thread_error');
    // }
  };

type NonEmpty<T> = [T, ...T[]];

export const emptyBoard: Board = [
  ['_', '_', '_'],
  ['_', '_', '_'],
  ['_', '_', '_'],
];

export type Position = { row: Row; column: Column };

export const toSlot = (board: Board, position: Position): Slot =>
  board[position.column][position.row];

export const setSlot = (
  board: Board,
  position: Position,
  slotNew: Slot
): Board => {
  return board.map((columns, columnIndex) =>
    columns.map((slot, rowIndex) =>
      columnIndex === position.column && rowIndex === position.row
        ? slotNew
        : slot
    )
  ) as Board;
};

export const allPositions: NonEmpty<Position> = [
  { row: 0, column: 0 },
  { row: 0, column: 1 },
  { row: 0, column: 2 },
  { row: 1, column: 0 },
  { row: 1, column: 1 },
  { row: 1, column: 2 },
  { row: 2, column: 0 },
  { row: 2, column: 1 },
  { row: 2, column: 2 },
];

export const toSlots = (board: Board): Slot[] => {
  return Object.values(board).flatMap((column) => Object.values(column));
};

type WinningGroup = [Position, Position, Position];

export const allWinningGroups: WinningGroup[] = [
  // vertical
  [
    { row: 0, column: 0 },
    { row: 1, column: 0 },
    { row: 2, column: 0 },
  ],
  [
    { row: 0, column: 1 },
    { row: 1, column: 1 },
    { row: 2, column: 1 },
  ],
  [
    { row: 0, column: 2 },
    { row: 1, column: 2 },
    { row: 2, column: 2 },
  ],
  // horizontal
  [
    { row: 0, column: 0 },
    { row: 0, column: 1 },
    { row: 0, column: 2 },
  ],
  [
    { row: 1, column: 0 },
    { row: 1, column: 1 },
    { row: 1, column: 2 },
  ],
  [
    { row: 2, column: 0 },
    { row: 2, column: 1 },
    { row: 2, column: 2 },
  ],
  // diagonal
  [
    { row: 0, column: 0 },
    { row: 1, column: 1 },
    { row: 2, column: 2 },
  ],
  [
    { row: 0, column: 2 },
    { row: 1, column: 1 },
    { row: 2, column: 0 },
  ],
];

type Wins = { X: WinningGroup[]; O: WinningGroup[]; None: WinningGroup[] };

const toWins = memoize(
  (x) => JSON.stringify(x),
  (board: Board): Wins => {
    const wins: Wins = {
      X: [],
      O: [],
      None: [],
    };

    for (let i = 0; i < allWinningGroups.length; i++) {
      const group = allWinningGroups[i];
      if (!group || !group[0] || !group[1] || !group[2]) {
        continue;
      }
      const a = toSlot(board, group[0]);
      const b = toSlot(board, group[1]);
      const c = toSlot(board, group[2]);

      const key: keyof typeof wins =
        a === 'X' && b === 'X' && c === 'X'
          ? 'X'
          : a === 'O' && b === 'O' && c === 'O'
          ? 'O'
          : 'None';

      if (!group) {
        continue;
      }

      wins[key].push(group);
    }

    return wins;
  }
);

export type Status = { type: 'Turn'; turn: PlayerType } | GameOver;

export type GameOver = { type: 'Win'; winner: PlayerType } | { type: 'Tie' };

export const toGameOver = (board: Board): GameOver | { type: 'none' } => {
  const wins = toWins(board);

  if (wins.X.length > 0) {
    return { type: 'Win', winner: 'X' };
  }

  if (wins.O.length > 0) {
    return { type: 'Win', winner: 'O' };
  }

  if (isTie(board)) {
    return { type: 'Tie' };
  }

  return { type: 'none' };
};

export const toStatus = (board: Board): Status => {
  const gameOver = toGameOver(board);

  if (gameOver.type === 'none') {
    return { type: 'Turn', turn: toTurn(board) };
  }

  return gameOver;
};

const isTie = (board: Board): boolean => {
  const wins = toWins(board);
  return (
    wins.O.length === 0 && wins.X.length === 0 && toSlotFrequency(board)._ === 0
  );
};

type SlotFrequency = { X: number; O: number; _: number };

const toSlotFrequency = (board: Board): SlotFrequency => {
  const frequency: SlotFrequency = { X: 0, O: 0, _: 0 };

  for (let i = 0; i < allPositions.length; i++) {
    const position = allPositions[i];
    if (!position) {
      continue;
    }
    const slot = toSlot(board, position);
    frequency[slot] += 1;
  }

  return frequency;
};

export const toTurn = (board: Board): PlayerType => {
  const frequency = toSlotFrequency(board);
  return frequency['X'] <= frequency['O'] ? 'X' : 'O';
};

export type MoveProblem =
  | 'not_players_turn'
  | 'position_is_taken'
  | 'game_over';

export const move = ({
  board,
  player,
  position,
}: {
  board: Board;
  player: PlayerType;
  position: Position;
}): Result<MoveProblem, Board> => {
  const status = toStatus(board);

  if (status.type === 'Tie' || status.type === 'Win') {
    return Err('game_over');
  }

  if (status.turn !== player) {
    return Err('not_players_turn');
  }

  const slot = toSlot(board, position);

  if (slot !== Empty) {
    return Err('position_is_taken');
  }

  const boardNext = setSlot(board, position, player);

  return Ok(boardNext);
};

export const toEmptyPositions = (board: Board): Position[] => {
  return allPositions.filter((position) => toSlot(board, position) === Empty);
};
