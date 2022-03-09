import { mapValues } from "../../utils";

type IPlayer = "x" | "o";

type ISlot = IPlayer | "empty";

type IColumn = {
  0: ISlot;
  1: ISlot;
  2: ISlot;
};

type IBoard = {
  0: IColumn;
  1: IColumn;
  2: IColumn;
};

// const ALL_WIN_POSITIONS_SETS: {
//   [key: number]: { 0: IPosition; 1: IPosition; 2: IPosition };
// } = {
//   0: {
//     0: { x: 0, y: 0 },
//     1: { x: 1, y: 0 },
//     2: { x: 2, y: 0 },
//   },
//   1: {
//     0: { x: 0, y: 1 },
//     1: { x: 1, y: 1 },
//     2: { x: 2, y: 1 },
//   },
//   2: {
//     0: { x: 0, y: 2 },
//     1: { x: 1, y: 2 },
//     2: { x: 2, y: 2 },
//   },
// };

export const toWinPositionSets = (_board: IBoard) => {
  return [];
};

// const EMPTY_BOARD: IBoard = {
//   0: {
//     0: "empty",
//     1: "empty",
//     2: "empty",
//   },
//   1: {
//     0: "empty",
//     1: "empty",
//     2: "empty",
//   },
//   2: {
//     0: "empty",
//     1: "empty",
//     2: "empty",
//   },
// };

type IPosition = {
  x: keyof IBoard;
  y: keyof IColumn;
};

type IPlayerMoved = {
  namespace: "tic-tac-toe";
  type: "PLAYER_MOVED";
  player: IPlayer;
  position: IPosition;
};

export type IGameEvent = IPlayerMoved;

export type IGameSessionEvent =
  | {
      namespace: "tic-tac-toe-game-session";
      gameSessionId: string;
      type: "CREATED_GAME_SESSION";
    }
  | {
      namespace: "tic-tac-toe-game-session";
      gameSessionId: string;
      type: "LEFTED_GAME_SESSION";
    }
  | {
      namespace: "tic-tac-toe-game-session";
      type: "GAME_EVENT";
      gameEvent: IGameEvent;
    };

export const turnReducer = (turn: IPlayer, event: IGameEvent): IPlayer => {
  if (event.type === "PLAYER_MOVED") {
    return event.player;
  }

  return turn;
};

const mapBoard = (
  board: IBoard,
  f: (slot: ISlot, x: IPosition["x"], y: IPosition["y"]) => ISlot
): IBoard => {
  return mapValues(board, (column, x) =>
    mapValues(column, (slot, y) => f(slot, x, y))
  );
};

export const boardReducer = (board: IBoard, event: IGameEvent): IBoard => {
  if (event.type === "PLAYER_MOVED") {
    return mapBoard(board, (slot, x, y) => {
      if (
        slot === "empty" &&
        event.position.x === x &&
        event.position.y === y
      ) {
        return event.player;
      }
      return slot;
    });
  }

  return board;
};
