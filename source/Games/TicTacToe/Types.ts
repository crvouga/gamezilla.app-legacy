import * as Board from "./Board";
import { ClientId } from "../../Bridge/Bridge";
import { Option, RemoteData, Result, Uuid, pipe } from "../../Core";
import { remove } from "../../Core/Record";

//
//
//
// Model
//
//
//

export type BackendModel = {
  rooms: { [id: RoomId]: Room };
  users: { [id: string]: User };
};

export type FrontendModel = {
  opened: ["Users"] | ["Player", Board.Player] | ["None"];
  rooms: { [id: RoomId]: Room };
  users: { [id: string]: User };
};

type User = { roomId: RoomId; userId: string };

//
//
//
// Msg
//
//
//

export type FrontendMsg =
  | ["ClickedBack"]
  | ["ClickedUser", { userId: string }]
  | ["ClickedAvatars"]
  | ["ClosedDrawer"]
  | ["ClickedPlayer", Board.Player]
  | LeaveRoom
  | JoinRoom
  | Move
  | PlayAs
  | Restart
  | CreateRoom
  | QuitPlaying
  | RemovePlayer
  | PlayAgain;

export type ToBackend =
  | ["Init"]
  | LeaveRoom
  | JoinRoom
  | Restart
  | PlayAs
  | Move
  | CreateRoom
  | QuitPlaying
  | RemovePlayer
  | PlayAgain;

export type ToFrontend =
  | [
      "Sync",
      {
        rooms: { [id: RoomId]: Room };
        users: { [id: string]: User };
      },
    ]
  | LeaveRoomResulted
  | JoinRoomResulted
  | RestartResulted
  | PlayAsResulted
  | MoveResulted
  | QuitPlayingResulted
  | RemovePlayerResulted
  | PlayAgainResulted
  | CreateRoomResulted;

export type BackendMsg =
  | ["ClientConnected", ClientId]
  | ["ClientDisconnected", ClientId];

//
//
//
//
//
//
//

type LeaveRoom = ["LeaveRoom", { currentUserId: string }];
type LeaveRoomResulted = ["LeaveRoomResulted", LeaveRoomResult];

type JoinRoom = ["JoinRoom", { currentUserId: string; roomId: RoomId }];
type JoinRoomResulted = ["JoinRoomResulted", JoinRoomResult];

type Restart = ["Restart", { currentUserId: string }];
type RestartResulted = [
  "RestartResulted",
  Result.Result<string, { userId: string }>,
];

type PlayAs = ["PlayAs", { player: Board.Player; currentUserId: string }];
type PlayAsResulted = [
  "PlayAsResulted",
  Result.Result<string, { userId: string; player: Board.Player }>,
];

type Move = ["Move", { currentUserId: string; position: Board.Position }];
type MoveResulted = ["MoveResulted", MoveResult];

type CreateRoom = ["CreateRoom", { currentUserId: string }];
type CreateRoomResulted = ["CreateRoomResulted", CreateRoomResult];

type PlayAgain = ["PlayAgain", { currentUserId: string }];
type PlayAgainResulted = [
  "PlayAgainResulted",
  Result.Result<string, { userId: string }>,
];

type RemovePlayer = [
  "RemovePlayer",
  { currentUserId: string; player: Board.Player },
];
type RemovePlayerResulted = [
  "RemovePlayerResulted",
  Result.Result<string, { player: Board.Player; hostId: string }>,
];

type QuitPlaying =
  | ["QuitPlaying", { currentUserId: string; player: Board.Player }];
type QuitPlayingResulted = [
  "QuitPlayingResulted",
  Result.Result<string, { userId: string }>,
];

//
//
//
// Room
//
//
//

export type RoomId = string;

export type Room = {
  roomId: RoomId;
  board: Board.Board;
  players: {
    [player in Board.Player]: RoomPlayer;
  };
  hostId: string;
  eventLog: RoomEvent[];
};

export type RoomEvent =
  | LeaveRoomResulted
  | JoinRoomResulted
  | RestartResulted
  | PlayAsResulted
  | MoveResulted
  | QuitPlayingResulted
  | RemovePlayerResulted
  | PlayAgainResulted
  | CreateRoomResulted;

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

type State = {
  rooms: { [id: RoomId]: Room };
  users: { [id: string]: User };
};

//
//
//
// Create Room
//
//
//

export type CreateRoomProblem = "user_is_already_in_a_room";

export type CreateRoomResult = Result.Result<CreateRoomProblem, State>;

export const createRoom = (
  { userId }: { userId: string },
  state: State,
): CreateRoomResult => {
  const user = state.users[userId];

  if (user && state.rooms[user.roomId]) {
    return Result.Err("user_is_already_in_a_room");
  }

  const roomId = Uuid.generateSync();

  const roomNew: Room = {
    roomId,
    hostId: userId,
    board: Board.emptyBoard,
    eventLog: [],
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

  const stateNew: State = {
    rooms: { ...state.rooms, [roomId]: roomNew },
    users: { ...state.users, [userId]: { userId, roomId } },
  };

  return Result.Ok(stateNew);
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

export type JoinRoomResult = Result.Result<JoinRoomProblem, State>;

export const joinRoom = (
  { userId, roomId }: { userId: string; roomId: string },
  state: State,
): JoinRoomResult => {
  const user = state.users[userId];

  if (user && state.rooms[user.roomId]) {
    return Result.Err("user_is_already_in_a_room");
  }

  const room = state.rooms[roomId];

  if (!room) {
    return Result.Err("room_does_not_exists");
  }

  const stateNew: State = {
    ...state,
    users: {
      ...state.users,
      [userId]: {
        userId,
        roomId,
      },
    },
  };

  return Result.Ok(stateNew);
};

//
//
//
// Leave Room
//
//
//

export type LeaveRoomProblem = "user_is_not_a_room";

export type LeaveRoomResult = Result.Result<LeaveRoomProblem, State>;

export const leaveRoom = (
  { userId }: { userId: string },
  state: State,
): LeaveRoomResult => {
  const user = state.users[userId];

  if (!user) {
    return Result.Err("user_is_not_a_room");
  }

  const room = state.rooms[user.roomId];

  if (!room) {
    return Result.Err("user_is_not_a_room");
  }

  const usersNew: State["users"] = remove(userId, state.users);

  const roomNew: Room = removeUserPlayer(userId, room);

  if (user.userId === room.hostId) {
    const hostSuccessor = pipe(
      Object.values(state.users),
      (users) =>
        users.filter(
          (user) => user.roomId === room.roomId && user.userId !== room.hostId,
        ),
      (users) => users[0],
    );

    if (!hostSuccessor) {
      return Result.Ok({
        users: usersNew,
        rooms: remove(room.roomId, state.rooms),
      });
    }

    const roomsNew: State["rooms"] = {
      ...state.rooms,
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
    ...state,
    users: usersNew,
    rooms: {
      ...state.rooms,
      [room.roomId]: roomNew,
    },
  });
};

const removeUserPlayer = (userId: string, room: Room): Room => {
  const { X, O } = room.players;

  const isX = X.type === "User" && X.userId === userId;

  const isO = O.type === "User" && O.userId === userId;

  if (isX && isO) {
    return {
      ...room,
      board: Board.emptyBoard,
      players: {
        X: { type: "None" },
        O: { type: "None" },
      },
    };
  }

  if (isX) {
    return {
      ...room,
      board: Board.emptyBoard,
      players: {
        ...room.players,
        X: { type: "None" },
      },
    };
  }

  if (isO) {
    return {
      ...room,
      board: Board.emptyBoard,
      players: {
        ...room.players,
        O: { type: "None" },
      },
    };
  }

  return room;
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
  | Board.MoveProblem;

export type MoveResult = Result.Result<MoveProblem, State>;

export const move = (
  { userId, position }: { userId: string; position: Board.Position },
  state: State,
): MoveResult => {
  const user = state.users[userId];

  if (!user) {
    return Result.Err("user_is_not_in_a_room");
  }

  const room = state.rooms[user.roomId];

  if (!room) {
    return Result.Err("user_is_not_in_a_room");
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

  const stateNew: State = {
    ...state,
    rooms: {
      [room.roomId]: {
        ...room,
        board: boardNew,
      },
    },
  };

  return Result.Ok(stateNew);
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
  {
    rooms,
    users,
  }: {
    rooms: { [id: RoomId]: Room };
    users: { [id: string]: User };
  },
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

export const toRoomStatus = (room: Room): RoomStatus => {
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
