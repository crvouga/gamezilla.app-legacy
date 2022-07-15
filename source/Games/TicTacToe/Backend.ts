import {
  broadcast,
  onConnect,
  onDisconnect,
  sendToFrontend,
} from "Bridge/Backend";
import { ClientId } from "Bridge/Bridge";
import { Cmd, Result, Sub, Uuid } from "Core";
import { get, remove } from "Core/Record";
import {
  BackendModel,
  BackendMsg,
  ToBackend,
  initRoom,
  toCurrentRoom,
} from "./Types";

//
//
//
// Model
//
//
//

export type Model = BackendModel;

export const init: Model = {
  rooms: {},
  users: {},
};

//
//
//
// Update
//
//
//

export type Msg = BackendMsg;

export const update = (msg: Msg, model: Model): [Model, Cmd.Cmd<Msg>] => {
  switch (msg[0]) {
    case "ClientDisconnected":
      return [model, Cmd.None];

    case "ClientConnected":
      return [
        model,
        sendToFrontend(msg[1], ["Games", ["TicTacToe", ["Sync", model]]]),
      ];
  }
};

export const updateFromFrontend = (
  clientId: ClientId,
  msg: ToBackend,
  model: Model,
): [Model, Cmd.Cmd<Msg>] => {
  switch (msg[0]) {
    case "Move": {
      return [model, Cmd.None];
    }

    case "JoinRoom": {
      const roomId = msg[1].roomId;
      const currentUserId = msg[1].userId;

      const maybeCurrentRoom = toCurrentRoom(currentUserId, model);

      if (maybeCurrentRoom.type === "Some") {
        const result = Result.Err(
          "User can not join a room when already in a room.",
        );
        return [
          model,
          sendToFrontend(clientId, [
            "Games",
            ["TicTacToe", ["JoinRoomResulted", result]],
          ]),
        ];
      }

      const maybeRoom = get(roomId, model.rooms);

      if (maybeRoom.type === "None") {
        const result = Result.Err("Room does not exist");

        return [
          model,
          sendToFrontend(clientId, [
            "Games",
            ["TicTacToe", ["JoinRoomResulted", result]],
          ]),
        ];
      }
      const modelNew = {
        ...model,
        users: {
          ...model.users,
          [currentUserId]: {
            userId: currentUserId,
            roomId,
          },
        },
      };
      return [
        modelNew,
        Cmd.batch([
          sendToFrontend(clientId, [
            "Games",
            ["TicTacToe", ["JoinRoomResulted", Result.Ok({})]],
          ]),
          broadcast(["Games", ["TicTacToe", ["Sync", modelNew]]]),
        ]),
      ];
    }

    case "LeaveRoom": {
      const currentUserId = msg[1].userId;

      const maybeCurrentRoom = toCurrentRoom(currentUserId, model);

      if (maybeCurrentRoom.type === "None") {
        return [
          model,
          sendToFrontend(clientId, [
            "Games",
            [
              "TicTacToe",
              ["LeaveRoomResulted", Result.Err("User is not in a room")],
            ],
          ]),
        ];
      }

      const currentRoom = maybeCurrentRoom.value;

      if (currentRoom.hostId === currentUserId) {
        const modelNew: Model = {
          ...model,
          rooms: remove(currentRoom.roomId, model.rooms),
          users: remove(currentUserId, model.users),
        };

        return [
          modelNew,
          Cmd.batch([
            broadcast(["Games", ["TicTacToe", ["Sync", modelNew]]]),
            sendToFrontend(clientId, [
              "Games",
              ["TicTacToe", ["LeaveRoomResulted", Result.Ok({})]],
            ]),
          ]),
        ];
      }

      const modelNew: Model = {
        ...model,
        users: remove(currentUserId, model.users),
      };

      return [
        modelNew,
        Cmd.batch([
          broadcast(["Games", ["TicTacToe", ["Sync", modelNew]]]),
          sendToFrontend(clientId, [
            "Games",
            ["TicTacToe", ["LeaveRoomResulted", Result.Ok({})]],
          ]),
        ]),
      ];
    }

    case "Init":
      return [
        model,
        sendToFrontend(clientId, ["Games", ["TicTacToe", ["Sync", model]]]),
      ];

    case "CreateRoom":
      const roomId = Uuid.generateSync();
      const roomNew = initRoom(roomId, msg[1].userId);
      const modelNew: Model = {
        ...model,
        rooms: {
          ...model.rooms,
          [roomNew.roomId]: roomNew,
        },
        users: {
          ...model.users,
          [msg[1].userId]: {
            userId: msg[1].userId,
            roomId: roomNew.roomId,
          },
        },
      };
      return [
        modelNew,
        Cmd.batch([
          broadcast(["Games", ["TicTacToe", ["Sync", modelNew]]]),
          sendToFrontend(clientId, [
            "Games",
            ["TicTacToe", ["CreateRoomResulted", Result.Ok({})]],
          ]),
        ]),
      ];
  }
};

//
//
//
// Subscriptions
//
//
//

export const subscriptions = (model: Model): Sub.Sub<Msg> => {
  return Sub.batch<Msg>([
    onConnect((clientId) => ["ClientConnected", clientId]),
    onDisconnect((clientId) => ["ClientDisconnected", clientId]),
  ]);
};
