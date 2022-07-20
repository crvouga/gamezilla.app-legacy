import {
  broadcast,
  onConnect,
  onDisconnect,
  sendToFrontend,
} from "../../Bridge/Backend";
import { ClientId } from "../../Bridge/Bridge";
import { Cmd, pipe, Result, Sub } from "../../Core";
import * as Board from "./Board";
import { BackendModel, BackendMsg, ToBackend, ToFrontend } from "./Types";
import * as Room from "./Room";

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
      return [model, broadcast(["Games", ["TicTacToe", ["Sync", model]]])];

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
    case "PlayAgain": {
      const { currentUserId } = msg[1];

      const maybeCurrentRoom = Room.toRoom(currentUserId, model);
      if (maybeCurrentRoom.type === "None") {
        return [
          model,
          sendToFrontend(clientId, [
            "Games",
            [
              "TicTacToe",
              ["PlayAgainResulted", Result.Err("User is not in a room")],
            ],
          ]),
        ];
      }
      const room = maybeCurrentRoom.value;

      const status = Room.toStatus(room);

      if (status.type === "NotReady") {
        return [
          model,
          sendToFrontend(clientId, [
            "Games",
            [
              "TicTacToe",
              [
                "PlayAgainResulted",
                Result.Err(
                  "To play again room must to be in a game over state",
                ),
              ],
            ],
          ]),
        ];
      }

      if (status.status.type === "Turn") {
        return [
          model,
          sendToFrontend(clientId, [
            "Games",
            [
              "TicTacToe",
              [
                "PlayAgainResulted",
                Result.Err(
                  "To play again room must to be in a game over state",
                ),
              ],
            ],
          ]),
        ];
      }

      const modelNew: Model = {
        ...model,
        rooms: {
          ...model.rooms,
          [room.roomId]: {
            ...room,
            board: Board.emptyBoard,
          },
        },
      };

      return [
        modelNew,
        Cmd.batch([broadcast(["Games", ["TicTacToe", ["Sync", modelNew]]])]),
      ];
    }

    case "RemovePlayer": {
      const { currentUserId, player } = msg[1];

      const maybeCurrentRoom = Room.toRoom(currentUserId, model);
      if (maybeCurrentRoom.type === "None") {
        return [
          model,
          Cmd.None,
          // sendToFrontend(clientId, ["Games", ["TicTacToe", event]]),
        ];
      }
      const room = maybeCurrentRoom.value;

      if (room.hostId !== currentUserId) {
        return [
          model,
          Cmd.None,
          // sendToFrontend(clientId, ["Games", ["TicTacToe", event]]),
        ];
      }

      const modelNew: Model = pipe({
        ...model,
        rooms: {
          ...model.rooms,
          [room.roomId]: {
            ...room,
            players: {
              ...room.players,
              [player]: { type: "None" },
            },
          },
        },
      });

      return [
        modelNew,
        Cmd.batch([
          broadcast(["Games", ["TicTacToe", ["Sync", modelNew]]]),
          // sendToFrontend(clientId, ["Games", ["TicTacToe", roomEvent]]),
        ]),
      ];
    }

    case "QuitPlaying": {
      const player = msg[1].player;
      const currentUserId = msg[1].currentUserId;

      const maybeCurrentRoom = Room.toRoom(currentUserId, model);
      if (maybeCurrentRoom.type === "None") {
        const result = Result.Err("User is not in a room");
        return [
          model,
          sendToFrontend(clientId, [
            "Games",
            ["TicTacToe", ["QuitPlayingResulted", result]],
          ]),
        ];
      }
      const room = maybeCurrentRoom.value;

      const modelNew: Model = pipe({
        ...model,
        rooms: {
          ...model.rooms,
          [room.roomId]: {
            ...room,
            board: Board.emptyBoard,
            players: {
              ...room.players,
              [player]: {
                type: "None",
              },
            },
          },
        },
      });

      return [
        modelNew,
        Cmd.batch([broadcast(["Games", ["TicTacToe", ["Sync", modelNew]]])]),
      ];
    }

    case "PlayAs": {
      const { currentUserId, player } = msg[1];

      const maybeCurrentRoom = Room.toRoom(currentUserId, model);
      if (maybeCurrentRoom.type === "None") {
        return [
          model,
          sendToFrontend(clientId, [
            "Games",
            [
              "TicTacToe",
              ["PlayAsResulted", Result.Err("User is not in a room")],
            ],
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

      const removedCurrentUserPlayer = Room.mapRoomPlayers(
        (roomPlayer) =>
          roomPlayer.type === "User" && roomPlayer.userId === currentUserId
            ? { type: "None" }
            : roomPlayer,
        room,
      );

      const modelNew: Model = pipe({
        ...model,
        rooms: {
          ...model.rooms,
          [room.roomId]: {
            ...removedCurrentUserPlayer,
            players: {
              ...removedCurrentUserPlayer.players,
              [msg[1].player]: {
                type: "User",
                userId: currentUserId,
              },
            },
          },
        },
      });

      return [
        modelNew,
        Cmd.batch([
          // sendToFrontend(clientId, ["Games", ["TicTacToe", roomEvent]]),
          broadcast(["Games", ["TicTacToe", ["Sync", modelNew]]]),
        ]),
      ];
    }

    case "Restart": {
      const { currentUserId } = msg[1];

      const maybeCurrentRoom = Room.toRoom(currentUserId, model);
      if (maybeCurrentRoom.type === "None") {
        const result = Result.Err("User is not in a room");
        return [
          model,
          sendToFrontend(clientId, [
            "Games",
            ["TicTacToe", ["RestartResulted", result]],
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
            ["TicTacToe", ["RestartResulted", result]],
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
          // sendToFrontend(clientId, ["Games", ["TicTacToe", roomEvent]]),
          broadcast(["Games", ["TicTacToe", ["Sync", modelNew]]]),
        ]),
      ];
    }

    case "Move": {
      const { currentUserId, position } = msg[1];

      const result = Room.move({ userId: currentUserId, position }, model);

      const toFrontend: ToFrontend = ["MoveResulted", result];

      if (result.type === "Err") {
        return [
          model,
          sendToFrontend(clientId, ["Games", ["TicTacToe", toFrontend]]),
        ];
      }

      return [
        result.value,
        Cmd.batch([
          sendToFrontend(clientId, ["Games", ["TicTacToe", toFrontend]]),
          broadcast(["Games", ["TicTacToe", ["Sync", result.value]]]),
        ]),
      ];
    }

    case "JoinRoom": {
      const { currentUserId, roomId } = msg[1];

      const result = Room.joinRoom({ userId: currentUserId, roomId }, model);

      const toFrontend: ToFrontend = ["JoinRoomResulted", result];

      if (result.type === "Err") {
        return [
          model,
          sendToFrontend(clientId, ["Games", ["TicTacToe", toFrontend]]),
        ];
      }

      return [
        result.value,
        Cmd.batch([
          sendToFrontend(clientId, ["Games", ["TicTacToe", toFrontend]]),
          broadcast(["Games", ["TicTacToe", ["Sync", result.value]]]),
        ]),
      ];
    }

    case "LeaveRoom": {
      const { currentUserId } = msg[1];

      const result = Room.leaveRoom({ userId: currentUserId }, model);

      const toFrontend: ToFrontend = ["LeaveRoomResulted", result];

      if (result.type === "Err") {
        return [
          model,
          sendToFrontend(clientId, ["Games", ["TicTacToe", toFrontend]]),
        ];
      }

      return [
        result.value,
        Cmd.batch([
          broadcast(["Games", ["TicTacToe", ["Sync", result.value]]]),
          sendToFrontend(clientId, ["Games", ["TicTacToe", toFrontend]]),
        ]),
      ];
    }

    case "Init":
      return [
        model,
        sendToFrontend(clientId, ["Games", ["TicTacToe", ["Sync", model]]]),
      ];

    case "CreateRoom":
      const { currentUserId } = msg[1];

      const result = Room.createRoom({ userId: currentUserId }, model);

      const toFrontend: ToFrontend = ["CreateRoomResulted", result];

      if (result.type === "Err") {
        return [
          model,
          sendToFrontend(clientId, ["Games", ["TicTacToe", toFrontend]]),
        ];
      }

      return [
        result.value,
        Cmd.batch([
          broadcast(["Games", ["TicTacToe", ["Sync", result.value]]]),
          sendToFrontend(clientId, ["Games", ["TicTacToe", toFrontend]]),
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
