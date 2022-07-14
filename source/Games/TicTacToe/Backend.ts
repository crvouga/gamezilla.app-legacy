import { broadcast, onConnect, sendToFrontend } from "Bridge/Backend";
import { ClientId } from "Bridge/Bridge";
import { Cmd, Result, Sub } from "Core";
import { initRoom } from "./Room";
import { BackendModel, BackendMsg, ToBackend } from "./Types";

//
//
//
// Model
//
//
//

export type Model = BackendModel;

export const init: Model = {
  runningRoomId: 0,
  rooms: {},
  userToRoom: {},
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
    case "ClientConnected":
      return [
        model,
        sendToFrontend(msg[1], [
          "Games",
          ["TicTacToe", ["GotRooms", model.rooms]],
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
    case "GetRooms":
      return [
        model,
        sendToFrontend(clientId, [
          "Games",
          ["TicTacToe", ["GotRooms", model.rooms]],
        ]),
      ];

    case "CreateRoom":
      const roomNew = initRoom(model.runningRoomId, msg[1].creatorId);
      const modelNew: Model = {
        ...model,
        runningRoomId: model.runningRoomId + 1,
        rooms: {
          ...model.rooms,
          [roomNew.roomId]: roomNew,
        },
        userToRoom: {
          ...model.userToRoom,
          [msg[1].creatorId]: roomNew.roomId,
        },
      };
      return [
        modelNew,
        Cmd.batch([
          broadcast(["Games", ["TicTacToe", ["GotRooms", modelNew.rooms]]]),
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
  return onConnect((clientId) => ["ClientConnected", clientId]);
};
