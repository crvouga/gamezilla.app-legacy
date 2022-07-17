import * as Store from "Store";
import {
  broadcast,
  onConnect,
  onDisconnect,
  sendToFrontend,
} from "Bridge/Backend";
import { ClientId } from "Bridge/Bridge";
import { Cmd, Result, Sub, Uuid, pipe } from "Core";
import { get, remove } from "Core/Record";
import * as Board from "./Board";
import {
  BackendModel,
  BackendMsg,
  RoomEvent,
  RoomId,
  ToBackend,
  initRoom,
  mapRoomPlayers,
  toCurrentRoom,
  toPlayer,
  toRoomStatus,
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

      const maybeCurrentRoom = toCurrentRoom(currentUserId, model);
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

      const status = toRoomStatus(room);

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
        Cmd.batch([
          sendToFrontend(clientId, [
            "Games",
            ["TicTacToe", ["PlayAgainResulted", Result.Ok({})]],
          ]),
          broadcast(["Games", ["TicTacToe", ["Sync", modelNew]]]),
        ]),
      ];
    }

    case "RemovePlayer": {
      const { currentUserId, player } = msg[1];

      const maybeCurrentRoom = toCurrentRoom(currentUserId, model);
      if (maybeCurrentRoom.type === "None") {
        const event: RoomEvent = [
          "RemovePlayerResulted",
          Result.Err("User is not in a room"),
        ];

        return [
          model,
          sendToFrontend(clientId, ["Games", ["TicTacToe", event]]),
        ];
      }
      const room = maybeCurrentRoom.value;

      if (room.hostId !== currentUserId) {
        const event: RoomEvent = [
          "RemovePlayerResulted",
          Result.Err("User is not in a room"),
        ];
        return [
          model,
          sendToFrontend(clientId, ["Games", ["TicTacToe", event]]),
        ];
      }

      const roomEvent: RoomEvent = ["RemovePlayerResulted", Result.Ok({})];

      const modelNew: Model = pipe(
        {
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
        },
        appendRoomEvent(room.roomId, roomEvent),
      );

      return [
        modelNew,
        Cmd.batch([
          broadcast(["Games", ["TicTacToe", ["Sync", modelNew]]]),
          sendToFrontend(clientId, ["Games", ["TicTacToe", roomEvent]]),
        ]),
      ];
    }

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
            ["TicTacToe", ["QuitPlayingResulted", result]],
          ]),
        ];
      }
      const room = maybeCurrentRoom.value;

      const roomEvent: RoomEvent = ["QuitPlayingResulted", Result.Ok({})];

      const modelNew: Model = pipe(
        {
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
        },
        appendRoomEvent(room.roomId, roomEvent),
      );

      return [
        modelNew,
        Cmd.batch([
          sendToFrontend(clientId, ["Games", ["TicTacToe", roomEvent]]),
          broadcast(["Games", ["TicTacToe", ["Sync", modelNew]]]),
        ]),
      ];
    }

    case "PlayAs": {
      const { currentUserId, player } = msg[1];

      const maybeCurrentRoom = toCurrentRoom(currentUserId, model);
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

      const removedCurrentUserPlayer = mapRoomPlayers(
        (roomPlayer) =>
          roomPlayer.type === "User" && roomPlayer.userId === currentUserId
            ? { type: "None" }
            : roomPlayer,
        room,
      );

      const roomEvent: RoomEvent = ["PlayAsResulted", Result.Ok({})];
      const modelNew: Model = pipe(
        {
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
        },
        appendRoomEvent(room.roomId, roomEvent),
      );

      return [
        modelNew,
        Cmd.batch([
          sendToFrontend(clientId, ["Games", ["TicTacToe", roomEvent]]),
          broadcast(["Games", ["TicTacToe", ["Sync", modelNew]]]),
        ]),
      ];
    }

    case "Restart": {
      const { currentUserId } = msg[1];

      const maybeCurrentRoom = toCurrentRoom(currentUserId, model);
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
          sendToFrontend(clientId, [
            "Games",
            ["TicTacToe", ["RestartResulted", Result.Ok({})]],
          ]),
          broadcast(["Games", ["TicTacToe", ["Sync", modelNew]]]),
        ]),
      ];
    }

    case "Move": {
      const { currentUserId, position } = msg[1];

      const maybeCurrentRoom = toCurrentRoom(currentUserId, model);
      if (maybeCurrentRoom.type === "None") {
        const event: RoomEvent = [
          "MoveResulted",
          {
            result: Result.Err("User is not in a room"),
            userId: currentUserId,
            position,
          },
        ];
        return [
          model,
          sendToFrontend(clientId, ["Games", ["TicTacToe", event]]),
        ];
      }

      const room = maybeCurrentRoom.value;

      const roomStatus = toRoomStatus(room);

      if (roomStatus.type === "NotReady") {
        const event: RoomEvent = [
          "MoveResulted",
          {
            result: Result.Err("Room is not ready"),
            userId: currentUserId,
            position,
          },
        ];

        return [
          model,
          sendToFrontend(clientId, ["Games", ["TicTacToe", event]]),
        ];
      }

      const player = toPlayer(currentUserId, room);

      if (player === "None") {
        const event: RoomEvent = [
          "MoveResulted",
          {
            userId: currentUserId,
            position: position,
            result: Result.Err("User is not a player"),
          },
        ];

        return [
          model,
          sendToFrontend(clientId, ["Games", ["TicTacToe", event]]),
        ];
      }

      const moveResult =
        player === "Both"
          ? Board.move(room.board, Board.toTurn(room.board), msg[1].position)
          : Board.move(room.board, player, msg[1].position);

      if (moveResult.type === "Err") {
        const event: RoomEvent = [
          "MoveResulted",
          {
            userId: currentUserId,
            position: position,
            result: moveResult,
          },
        ];

        return [
          model,
          sendToFrontend(clientId, ["Games", ["TicTacToe", event]]),
        ];
      }

      const event: RoomEvent = [
        "MoveResulted",
        {
          userId: currentUserId,
          position: position,
          result: Result.Ok({}),
        },
      ];

      const modelNew: Model = pipe(
        {
          ...model,
          rooms: {
            ...model.rooms,
            [room.roomId]: {
              ...room,
              board: moveResult.value,
            },
          },
        },
        appendRoomEvent(room.roomId, event),
      );

      return [
        modelNew,
        Cmd.batch([
          sendToFrontend(clientId, ["Games", ["TicTacToe", event]]),
          broadcast(["Games", ["TicTacToe", ["Sync", modelNew]]]),
        ]),
      ];
    }

    case "JoinRoom": {
      const { currentUserId, roomId } = msg[1];

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

      const roomEvent: RoomEvent = ["JoinRoomResulted", Result.Ok({})];

      const modelNew = pipe(
        {
          ...model,
          users: {
            ...model.users,
            [currentUserId]: {
              userId: currentUserId,
              roomId,
            },
          },
        },
        appendRoomEvent(roomId, roomEvent),
      );

      return [
        modelNew,
        Cmd.batch([
          sendToFrontend(clientId, ["Games", ["TicTacToe", roomEvent]]),
          broadcast(["Games", ["TicTacToe", ["Sync", modelNew]]]),
        ]),
      ];
    }

    case "LeaveRoom": {
      const { currentUserId } = msg[1];

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

      const room = maybeCurrentRoom.value;

      if (room.hostId === currentUserId) {
        const modelNew: Model = {
          ...model,
          rooms: remove(room.roomId, model.rooms),
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

      const roomEvent: RoomEvent = ["LeaveRoomResulted", Result.Ok({})];

      const modelNew: Model = pipe(
        {
          ...model,
          users: remove(currentUserId, model.users),
          rooms: {
            ...model.rooms,
            [room.roomId]: pipe(
              room,
              (room) =>
                mapRoomPlayers(
                  (roomPlayer) =>
                    roomPlayer.type === "User" &&
                    roomPlayer.userId === currentUserId
                      ? { type: "None" }
                      : roomPlayer,
                  room,
                ),
              (room) => ({
                ...room,
                board: Board.emptyBoard,
              }),
            ),
          },
        },
        appendRoomEvent(room.roomId, roomEvent),
      );

      return [
        modelNew,
        Cmd.batch([
          broadcast(["Games", ["TicTacToe", ["Sync", modelNew]]]),
          sendToFrontend(clientId, ["Games", ["TicTacToe", roomEvent]]),
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
      const roomEvent: RoomEvent = ["CreateRoomResulted", Result.Ok({})];

      const roomNew = initRoom(roomId, msg[1].currentUserId);
      const modelNew: Model = pipe(
        {
          ...model,
          rooms: {
            ...model.rooms,
            [roomNew.roomId]: roomNew,
          },
          users: {
            ...model.users,
            [msg[1].currentUserId]: {
              userId: msg[1].currentUserId,
              roomId: roomNew.roomId,
            },
          },
        },
        appendRoomEvent(roomId, roomEvent),
      );

      return [
        modelNew,
        Cmd.batch([
          broadcast(["Games", ["TicTacToe", ["Sync", modelNew]]]),
          sendToFrontend(clientId, ["Games", ["TicTacToe", roomEvent]]),
        ]),
      ];
  }
};

const appendRoomEvent =
  (roomId: RoomId, roomEvent: RoomEvent) =>
  (model: Model): Model => {
    const room = model.rooms[roomId];

    if (!room) {
      return model;
    }

    return {
      ...model,
      rooms: {
        ...model.rooms,
        [roomId]: {
          ...room,
          eventLog: [...room.eventLog, roomEvent],
        },
      },
    };
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
