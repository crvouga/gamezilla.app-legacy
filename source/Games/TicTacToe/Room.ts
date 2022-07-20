import { Option, pipe, Result, Uuid } from "../../Core";
import { remove } from "../../Core/Record";
import * as Board from "./Board";

//
//
//
// Model
//
//
//

export type Model = {
  rooms: {
    [id: RoomId]: Room;
  };
  users: {
    [id: string]: {
      userId: string;
      roomId: RoomId;
    };
  };
};

export type RoomId = string;

export type Room = {
  roomId: RoomId;
  board: Board.Board;
  players: {
    [player in Board.Player]: RoomPlayer;
  };
  hostId: string;
};

//
//
//
// Create Room
//
//
//

export type CreateRoomProblem = "user_is_already_in_a_room";

export type CreateRoomResult = Result.Result<CreateRoomProblem, Model>;

export const createRoom = (
  { userId }: { userId: string },
  model: Model,
): CreateRoomResult => {
  const user = model.users[userId];

  if (user && model.rooms[user.roomId]) {
    return Result.Err("user_is_already_in_a_room");
  }

  const roomId = Uuid.generateSync();

  const roomNew: Room = {
    roomId,
    hostId: userId,
    board: Board.emptyBoard,
    players: {
      X: {
        type: "User",
        userId: userId,
      },
      O: {
        type: "None",
      },
    },
  };

  const modelNew: Model = {
    rooms: { ...model.rooms, [roomId]: roomNew },
    users: { ...model.users, [userId]: { userId, roomId } },
  };

  return Result.Ok(modelNew);
};

//
//
//
// Start Playing
//
//
//

export type StartPlayingProblem = "user_is_not_in_a_room" | "player_is_taken";

export type StartPlayingResult = Result.Result<StartPlayingProblem, Model>;

export const startPlaying = (
  { userId, player }: { userId: string; player: Board.Player },
  model: Model,
): StartPlayingResult => {
  const user = model.users[userId];

  if (!user) {
    return Result.Err("user_is_not_in_a_room");
  }

  const room = model.rooms[user.roomId];

  if (!room) {
    return Result.Err("user_is_not_in_a_room");
  }

  const roomPlayer = room.players[player];

  if (roomPlayer.type === "User") {
    return Result.Err("player_is_taken");
  }

  const roomNew: Room = pipe(
    room,
    (room) => resetGame(removeUserAsPlayer(userId, room)),
    (room) => ({
      ...room,
      players: {
        ...room.players,
        [player]: {
          type: "User",
          userId,
        },
      },
    }),
  );

  const modelNew: Model = {
    ...model,
    rooms: {
      [room.roomId]: roomNew,
    },
  };

  return Result.Ok(modelNew);
};

//
//
//
// Join Room
//
//
//

export type JoinRoomProblem =
  | "user_is_already_in_a_room"
  | "room_does_not_exists";

export type JoinRoomResult = Result.Result<JoinRoomProblem, Model>;

export const joinRoom = (
  { userId, roomId }: { userId: string; roomId: string },
  model: Model,
): JoinRoomResult => {
  const user = model.users[userId];

  if (user && model.rooms[user.roomId]) {
    return Result.Err("user_is_already_in_a_room");
  }

  const room = model.rooms[roomId];

  if (!room) {
    return Result.Err("room_does_not_exists");
  }

  const modelNew: Model = {
    ...model,
    users: {
      ...model.users,
      [userId]: {
        userId,
        roomId,
      },
    },
  };

  return Result.Ok(modelNew);
};

//
//
//
// Leave Room
//
//
//

export type LeaveRoomProblem = "user_is_not_a_room";

export type LeaveRoomResult = Result.Result<LeaveRoomProblem, Model>;

export const leaveRoom = (
  { userId }: { userId: string },
  model: Model,
): LeaveRoomResult => {
  const user = model.users[userId];

  if (!user) {
    return Result.Err("user_is_not_a_room");
  }

  const room = model.rooms[user.roomId];

  if (!room) {
    return Result.Err("user_is_not_a_room");
  }

  const usersNew = remove(userId, model.users);

  const roomNew = resetGame(removeUserAsPlayer(userId, room));

  if (user.userId === room.hostId) {
    const hostSuccessor = pipe(
      Object.values(model.users),
      (users) =>
        users.filter(
          (user) => user.roomId === room.roomId && user.userId !== room.hostId,
        ),
      (users) => users[0],
    );

    if (!hostSuccessor) {
      return Result.Ok({
        users: usersNew,
        rooms: remove(room.roomId, model.rooms),
      });
    }

    const roomsNew: Model["rooms"] = {
      ...model.rooms,
      [room.roomId]: {
        ...roomNew,
        hostId: hostSuccessor.userId,
      },
    };

    return Result.Ok({
      users: usersNew,
      rooms: roomsNew,
    });
  }

  return Result.Ok({
    ...model,
    users: usersNew,
    rooms: {
      ...model.rooms,
      [room.roomId]: roomNew,
    },
  });
};

//
//
//
// Move
//
//
//

export type MoveProblem =
  | "user_is_not_in_a_room"
  | "user_is_not_a_player"
  | "game_is_not_ready"
  | Board.MoveProblem;

export type MoveResult = Result.Result<MoveProblem, Model>;

export const move = (
  { userId, position }: { userId: string; position: Board.Position },
  model: Model,
): MoveResult => {
  const user = model.users[userId];

  if (!user) {
    return Result.Err("user_is_not_in_a_room");
  }

  const room = model.rooms[user.roomId];

  if (!room) {
    return Result.Err("user_is_not_in_a_room");
  }

  const status = toStatus(room);

  if (status.type === "NotReady") {
    return Result.Err("game_is_not_ready");
  }

  const userPlayer = toPlayer(userId, room);

  if (userPlayer === "None") {
    return Result.Err("user_is_not_a_player");
  }

  const player = userPlayer === "Both" ? Board.toTurn(room.board) : userPlayer;

  const moveResult = Board.move(room.board, player, position);

  if (moveResult.type === "Err") {
    return Result.Err(moveResult.error);
  }

  const boardNew = moveResult.value;

  const modelNew: Model = {
    ...model,
    rooms: {
      [room.roomId]: {
        ...room,
        board: boardNew,
      },
    },
  };

  return Result.Ok(modelNew);
};

export type RoomPlayer = { type: "User"; userId: string } | { type: "None" };

export const toPlayer = (
  userId: string,
  room: Room,
): Board.Player | "None" | "Both" => {
  const { X, O } = room.players;

  const isX = X.type === "User" && X.userId === userId;

  const isO = O.type === "User" && O.userId === userId;

  if (isX && isO) {
    return "Both";
  }

  if (isO) {
    return "O";
  }

  if (isX) {
    return "X";
  }

  return "None";
};

export const toRoom = (
  userId: string,
  { rooms, users }: Model,
): Option.Option<Room> => {
  const user = users[userId];

  if (!user) {
    return Option.None;
  }

  const room = rooms[user.roomId];

  if (!room) {
    return Option.None;
  }

  return Option.Some(room);
};

export type RoomStatus =
  | { type: "NotReady"; status: "MissingBoth" | "MissingX" | "MissingO" }
  | { type: "Ready"; status: Board.Status };

export const toStatus = (room: Room): RoomStatus => {
  if (room.players.X.type === "None" && room.players.O.type === "None") {
    return { type: "NotReady", status: "MissingBoth" };
  }

  if (room.players.X.type === "None") {
    return { type: "NotReady", status: "MissingX" };
  }

  if (room.players.O.type === "None") {
    return { type: "NotReady", status: "MissingO" };
  }

  return { type: "Ready", status: Board.toStatus(room.board) };
};

export const mapRoomPlayers = (
  mapper: (roomPlayer: RoomPlayer) => RoomPlayer,
  room: Room,
): Room => {
  return {
    ...room,
    players: {
      X: mapper(room.players.X),
      O: mapper(room.players.O),
    },
  };
};

const removeUserAsPlayer = (userId: string, room: Room): Room => {
  const { X, O } = room.players;

  const isX = X.type === "User" && X.userId === userId;

  const isO = O.type === "User" && O.userId === userId;

  if (isX && isO) {
    return {
      ...room,
      players: {
        X: { type: "None" },
        O: { type: "None" },
      },
    };
  }

  if (isX) {
    return {
      ...room,
      players: {
        ...room.players,
        X: { type: "None" },
      },
    };
  }

  if (isO) {
    return {
      ...room,
      players: {
        ...room.players,
        O: { type: "None" },
      },
    };
  }

  return room;
};

const resetGame = (room: Room): Room => {
  return {
    ...room,
    board: Board.emptyBoard,
  };
};
