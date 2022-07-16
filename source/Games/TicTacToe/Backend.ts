import * as Store from "Store";
import {
  broadcast,
  onConnect,
  onDisconnect,
  sendToFrontend,
} from "Bridge/Backend";
import { ClientId } from "Bridge/Bridge";
import { Cmd, Result, Sub, Uuid } from "Core";
import { get, remove } from "Core/Record";
import * as Board from "./Board";
import {
  BackendModel,
  BackendMsg,
  ToBackend,
  initRoom,
  toCurrentRoom,
  toPlayer,
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
      return [model, broadcast(["Games", ["TicTacToe", ["Sync", model]]])];
  }
};

export const updateFromFrontend = (
  clientId: ClientId,
  msg: ToBackend,
  model: Model,
): [Model, Cmd.Cmd<Msg>] => {
  switch (msg[0]) {
    case "QuitPlaying": {
      const player = msg[1].player;
      const currentUserId = msg[1].currentUserId;

      const maybeCurrentRoom = toCurrentRoom(currentUserId, model);
      if (maybeCurrentRoom.type === "None") {
        const result = Result.Err("User is not in a room");
        return [
          model,
          sendToFrontend(clientId, [
            "Games",
            ["TicTacToe", ["MoveResulted", result]],
          ]),
        ];
      }
      const room = maybeCurrentRoom.value;

      const modelNew: Model = {
        ...model,
        rooms: {
          ...model.rooms,
          [room.roomId]: {
            ...room,
            players: {
              ...room.players,
              [player]: {
                type: "None",
              },
            },
          },
        },
      };

      return [
        modelNew,
        Cmd.batch([
          sendToFrontend(clientId, [
            "Games",
            ["TicTacToe", ["PlayAsResulted", Result.Ok({})]],
          ]),
          broadcast(["Games", ["TicTacToe", ["Sync", modelNew]]]),
        ]),
      ];
    }

    case "PlayAs": {
      const player = msg[1].player;
      const currentUserId = msg[1].userId;

      const maybeCurrentRoom = toCurrentRoom(currentUserId, model);
      if (maybeCurrentRoom.type === "None") {
        const result = Result.Err("User is not in a room");
        return [
          model,
          sendToFrontend(clientId, [
            "Games",
            ["TicTacToe", ["MoveResulted", result]],
          ]),
        ];
      }
      const room = maybeCurrentRoom.value;

      const isTaken = room.players[player].type === "User";

      if (isTaken) {
        const result = Result.Err(`Player is taken`);
        return [
          model,
          sendToFrontend(clientId, [
            "Games",
            ["TicTacToe", ["PlayAsResulted", result]],
          ]),
        ];
      }

      const isX =
        room.players.X.type === "User" &&
        room.players.X.userId === currentUserId;

      const isO =
        room.players.O.type === "User" &&
        room.players.O.userId === currentUserId;

      if (isX || isO) {
        const result = Result.Err(`User is already player ${player}`);
        return [
          model,
          sendToFrontend(clientId, [
            "Games",
            ["TicTacToe", ["PlayAsResulted", result]],
          ]),
        ];
      }

      const modelNew: Model = {
        ...model,
        rooms: {
          ...model.rooms,
          [room.roomId]: {
            ...room,
            players: {
              ...room.players,
              [msg[1].player]: {
                type: "User",
                userId: currentUserId,
              },
            },
          },
        },
      };

      return [
        modelNew,
        Cmd.batch([
          sendToFrontend(clientId, [
            "Games",
            ["TicTacToe", ["PlayAsResulted", Result.Ok({})]],
          ]),
          broadcast(["Games", ["TicTacToe", ["Sync", modelNew]]]),
        ]),
      ];
    }

    case "Restart": {
      const currentUserId = msg[1].userId;

      const maybeCurrentRoom = toCurrentRoom(currentUserId, model);
      if (maybeCurrentRoom.type === "None") {
        const result = Result.Err("User is not in a room");
        return [
          model,
          sendToFrontend(clientId, [
            "Games",
            ["TicTacToe", ["MoveResulted", result]],
          ]),
        ];
      }

      const room = maybeCurrentRoom.value;

      if (room.hostId !== currentUserId) {
        const result = Result.Err("User is not the host");
        return [
          model,
          sendToFrontend(clientId, [
            "Games",
            ["TicTacToe", ["MoveResulted", result]],
          ]),
        ];
      }

      const roomNew = {
        ...room,
        board: Board.emptyBoard,
      };

      const modelNew = {
        ...model,
        rooms: {
          ...model.rooms,
          [roomNew.roomId]: roomNew,
        },
      };

      return [
        modelNew,
        Cmd.batch([
          sendToFrontend(clientId, [
            "Games",
            ["TicTacToe", ["RestartResulted", Result.Ok({})]],
          ]),
          broadcast(["Games", ["TicTacToe", ["Sync", modelNew]]]),
        ]),
      ];
    }

    case "Move": {
      const currentUserId = msg[1].userId;

      const maybeCurrentRoom = toCurrentRoom(currentUserId, model);
      if (maybeCurrentRoom.type === "None") {
        const result = Result.Err("User is not in a room");
        return [
          model,
          sendToFrontend(clientId, [
            "Games",
            ["TicTacToe", ["MoveResulted", result]],
          ]),
        ];
      }

      const room = maybeCurrentRoom.value;

      const player = toPlayer(currentUserId, room);

      if (player === "None") {
        const result = Result.Err("User is not a player");
        return [
          model,
          sendToFrontend(clientId, [
            "Games",
            ["TicTacToe", ["MoveResulted", result]],
          ]),
        ];
      }

      const moveResult =
        player === "Both"
          ? Board.move(room.board, Board.toTurn(room.board), msg[1].position)
          : Board.move(room.board, player, msg[1].position);

      if (moveResult.type === "Err") {
        return [
          model,
          sendToFrontend(clientId, [
            "Games",
            ["TicTacToe", ["MoveResulted", moveResult]],
          ]),
        ];
      }

      const roomNew = {
        ...room,
        board: moveResult.value,
      };

      const modelNew = {
        ...model,
        rooms: {
          ...model.rooms,
          [roomNew.roomId]: roomNew,
        },
      };

      return [
        modelNew,
        Cmd.batch([
          sendToFrontend(clientId, [
            "Games",
            ["TicTacToe", ["MoveResulted", Result.Ok({})]],
          ]),
          broadcast(["Games", ["TicTacToe", ["Sync", modelNew]]]),
        ]),
      ];
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

const syncRoom = (roomId: string, model: Model): Cmd.Cmd<Msg> => {
  // const t = Store.Profile.loadMany()
  return broadcast(["Games", ["TicTacToe", ["Sync", model]]]);
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
