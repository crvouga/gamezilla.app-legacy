import { sendToBackend } from "../Bridge/Frontend"
import { Cmd, pipe, RemoteData, Unit } from "../Core"
import { UserId } from "../Data"
import * as Route from "../Route"
import * as Snackbar from "../Snackbar"
import * as Store from "../Store"
import * as UI from "../UI"
import * as GameRooms from "./Rooms"
import {
  ChangeGame,
  CreateRoom,
  FrontendModel,
  FrontendMsg,
  GameModel,
  JoinRoom,
  LeaveRoom,
  RoomModel,
  ToFrontend,
} from "./Types"

//
//
//
// Model
//
//
//

export type Model = FrontendModel

export const init: [Model, Cmd.Cmd<Msg>] = [
  {
    rooms: GameRooms.init,
    createRoom: RemoteData.NotAsked,
    joinRoom: RemoteData.NotAsked,
    leaveRoom: RemoteData.NotAsked,
    changeGame: RemoteData.NotAsked,
  },
  sendToBackend(["GameRoom", ["Init"]]),
]

//
//
//
// Msg
//
//
//

export type Msg = FrontendMsg

type OutAction = Snackbar.Action | Store.Action

export type Action =
  | ["GameRoom", CreateRoom]
  | ["GameRoom", JoinRoom]
  | ["GameRoom", LeaveRoom]
  | ["GameRoom", ChangeGame]

//
//
//
// Update
//
//
//

export const runAction = (
  action: Action,
  model: Model,
): [Model, Cmd.Cmd<Msg>] => {
  switch (action[1][0]) {
    case "CreateRoom": {
      const { roomId, userId } = action[1][1]
      return [
        { ...model, createRoom: RemoteData.Loading },
        sendToBackend(["GameRoom", ["CreateRoom", { roomId, userId }]]),
      ]
    }

    case "JoinRoom": {
      const { roomId, userId } = action[1][1]
      return [
        { ...model, joinRoom: RemoteData.Loading },
        sendToBackend(["GameRoom", ["JoinRoom", { roomId, userId }]]),
      ]
    }

    case "LeaveRoom": {
      const { userId } = action[1][1]
      return [
        { ...model, leaveRoom: RemoteData.Loading },
        sendToBackend(["GameRoom", ["LeaveRoom", { userId }]]),
      ]
    }

    case "ChangeGame": {
      const { userId, gameName } = action[1][1]
      return [
        { ...model, leaveRoom: RemoteData.Loading },
        sendToBackend(["GameRoom", ["ChangeGame", { userId, gameName }]]),
      ]
    }
  }
}

export const update = (
  { currentUserId }: { currentUserId: UserId.UserId },
  msg: Msg,
  model: Model,
): [Model, Cmd.Cmd<Msg>, OutAction[]] => {
  switch (msg[0]) {
    case "Noop": {
      return [model, Cmd.None, []]
    }
  }
}

export const updateFromBackend = (
  msg: ToFrontend,
  model: Model,
): [Model, Cmd.Cmd<Msg>, OutAction[]] => {
  switch (msg[0]) {
    case "Sync": {
      const userIds = Object.values(msg[1].users).map((user) => user.userId)

      const action: OutAction = [
        "Store",
        ["Profile", ["FindMany", { userIds }]],
      ]

      return [{ ...model, rooms: msg[1] }, Cmd.None, [action]]
    }

    case "CreateRoomResulted": {
      const createRoom = pipe(
        msg[1],
        RemoteData.fromResult,
        RemoteData.mapSuccess(() => Unit),
      )

      const actions: OutAction[] =
        createRoom.type === "Failure"
          ? [
              [
                "Snackbar",
                [
                  "Enqueue",
                  {
                    variant: "Error",
                    message: createRoom.problem,
                  },
                ],
              ],
            ]
          : []

      const cmd: Cmd.Cmd<Msg> =
        createRoom.type === "Success"
          ? Route.replace({ type: "GameRoom" })
          : Cmd.None

      return [{ ...model, createRoom }, cmd, actions]
    }

    case "LeaveRoomResulted": {
      const leaveRoom = pipe(
        msg[1],
        RemoteData.fromResult,
        RemoteData.mapSuccess(() => Unit),
      )

      const actions: OutAction[] =
        leaveRoom.type === "Failure"
          ? [
              [
                "Snackbar",
                [
                  "Enqueue",
                  {
                    variant: "Error",
                    message: leaveRoom.problem,
                  },
                ],
              ],
            ]
          : []

      return [{ ...model, leaveRoom }, Cmd.None, actions]
    }

    case "JoinRoomResulted": {
      const joinRoom = pipe(
        msg[1],
        RemoteData.fromResult,
        RemoteData.mapSuccess(() => Unit),
      )

      const actions: OutAction[] =
        joinRoom.type === "Failure"
          ? [
              [
                "Snackbar",
                [
                  "Enqueue",
                  {
                    variant: "Error",
                    message: joinRoom.problem,
                  },
                ],
              ],
            ]
          : []

      return [{ ...model, joinRoom }, Cmd.None, actions]
    }

    case "ChangeGameResulted": {
      const changeGame = pipe(
        msg[1],
        RemoteData.fromResult,
        RemoteData.mapSuccess(() => Unit),
      )

      const actions: OutAction[] =
        changeGame.type === "Failure"
          ? [
              [
                "Snackbar",
                [
                  "Enqueue",
                  {
                    variant: "Error",
                    message: changeGame.problem,
                  },
                ],
              ],
            ]
          : []

      return [{ ...model, changeGame }, Cmd.None, actions]
    }
  }
}

//
//
//
//
// View
//
//
//
//

export const viewGameRoom = ({
  room,
  game,
}: {
  room: RoomModel
  game: GameModel
}): UI.View<Msg> => {
  switch (game[0]) {
    case "ConnectFour": {
      return () => <>view connect four</>
    }

    case "Snake": {
      return () => <>view snake</>
    }

    case "TicTacToe": {
      return () => <>view tic tac toe</>
    }
  }
}
