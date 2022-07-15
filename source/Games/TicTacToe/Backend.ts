import {
  broadcast,
  onConnect,
  onDisconnect,
  sendToFrontend,
} from "Bridge/Backend";
import { ClientId } from "Bridge/Bridge";
import { Cmd, Result, Sub, Uuid } from "Core";
import { dissoc } from "Core/Record";
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
        sendToFrontend(msg[1], [
          "Games",
          [
            "TicTacToe",
            ["GotRooms", { rooms: model.rooms, users: model.users }],
          ],
        ]),
      ];
  }
};

export const updateFromFrontend = (
  clientId: ClientId,
  msg: ToBackend,
  model: Model,
): [Model, Cmd.Cmd<Msg>] => {
  switch (msg[0]) {
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
          rooms: dissoc(currentRoom.roomId, model.rooms),
          users: dissoc(currentUserId, model.users),
        };

        return [
          modelNew,
          Cmd.batch([
            broadcast(["Games", ["TicTacToe", ["GotRooms", modelNew]]]),
            sendToFrontend(clientId, [
              "Games",
              ["TicTacToe", ["LeaveRoomResulted", Result.Ok({})]],
            ]),
          ]),
        ];
      }

      const modelNew: Model = {
        ...model,
        users: dissoc(currentUserId, model.users),
      };

      return [
        modelNew,
        Cmd.batch([
          broadcast(["Games", ["TicTacToe", ["GotRooms", modelNew]]]),
          sendToFrontend(clientId, [
            "Games",
            ["TicTacToe", ["LeaveRoomResulted", Result.Ok({})]],
          ]),
        ]),
      ];
    }

    case "GetRooms":
      return [
        model,
        sendToFrontend(clientId, [
          "Games",
          [
            "TicTacToe",
            ["GotRooms", { rooms: model.rooms, users: model.users }],
          ],
        ]),
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
          broadcast([
            "Games",
            [
              "TicTacToe",
              ["GotRooms", { rooms: modelNew.rooms, users: modelNew.users }],
            ],
          ]),
          sendToFrontend(clientId, [
            "Games",
            ["TicTacToe", ["CreateRoomResulted", Result.Ok(roomNew)]],
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
