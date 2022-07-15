import { ClientId } from "Bridge/Bridge";
import { Option, RemoteData, Result, pipe } from "Core";
import * as Board from "./Board";

//
//
//
// Model
//
//
//

export type BackendModel = {
  rooms: Rooms;
  users: Users;
};

export type FrontendModel = {
  // mutations
  createRoom: RemoteData.RemoteData<string, {}>;
  leaveRoom: RemoteData.RemoteData<string, {}>;
  joinRoom: RemoteData.RemoteData<string, {}>;
  // queries
  getRooms: RemoteData.RemoteData<string, {}>;
  //
  rooms: Rooms;
  users: Users;
};

export type Rooms = {
  [roomId: RoomId]: Room;
};

export type Users = {
  [userId: string]: {
    userId: string;
    roomId: RoomId;
  };
};

//
//
//
// Msg
//
//
//

export type BackendMsg =
  | ["ClientConnected", ClientId]
  | ["ClientDisconnected", ClientId];

export type FrontendMsg =
  | ["ClickedCreateRoom"]
  | ["ClickedLeaveRoom"]
  | ["ClickedJoinRoom", { roomId: RoomId }]
  | ["ClickedBack"]
  | ["ClickedBoard", Board.Position];

export type ToFrontend =
  | ["CreateRoomResulted", Result.Result<string, {}>]
  | ["LeaveRoomResulted", Result.Result<string, {}>]
  | ["JoinRoomResulted", Result.Result<string, {}>]
  | [
      "Sync",
      {
        rooms: Rooms;
        users: Users;
      },
    ];

export type ToBackend =
  | ["CreateRoom", { userId: string }]
  | ["GetRooms"]
  | ["LeaveRoom", { userId: string }]
  | ["JoinRoom", { userId: string; roomId: RoomId }];

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
    X: Player;
    O: Player;
  };
  hostId: string;
};

export const initRoom = (roomId: RoomId, hostId: string): Room => {
  return {
    roomId,
    board: Board.emptyBoard,
    players: {
      X: { type: "User", userId: hostId },
      O: { type: "User", userId: hostId },
    },
    hostId,
  };
};

export type Player =
  | { type: "User"; userId: string }
  | { type: "Computer" }
  | { type: "None" };

export const toCurrentRoom = (
  userId: string,
  { rooms, users }: { rooms: Rooms; users: Users },
): Option.Option<Room> => {
  const subset = Object.values(users)
    .filter((user) => user.userId === userId)
    .map((user) => rooms[user.roomId])
    .flatMap((maybeRoom) => (maybeRoom ? [maybeRoom] : []));

  return Option.fromNullable(subset[0]);
};
