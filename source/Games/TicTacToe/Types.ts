import { ClientId } from "Bridge/Bridge";
import { RemoteData, Result } from "Core";
import { Room, RoomId } from "./Room";

export type BackendModel = {
  runningRoomId: RoomId;
  rooms: {
    [roomId: RoomId]: Room;
  };
  userToRoom: {
    [userId: string]: RoomId;
  };
};

export type FrontendModel = {
  createRoom: RemoteData.RemoteData<string, {}>;
  getRooms: RemoteData.RemoteData<string, {}>;
  rooms: {
    [roomId: string]: Room;
  };
};

export type BackendMsg = ["ClientConnected", ClientId];

export type FrontendMsg = ["ClickedNewRoom"] | ["ClickedBack"];

export type ToFrontend =
  | ["CreateRoomResulted", Result.Result<string, Room>]
  | ["GotRooms", BackendModel["rooms"]];

export type ToBackend = ["CreateRoom", { creatorId: string }] | ["GetRooms"];
