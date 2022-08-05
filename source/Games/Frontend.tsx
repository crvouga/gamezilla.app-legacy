import { sendToBackend } from "../Bridge/Frontend"
import { Cmd, pipe, RemoteData, Sub, Unit } from "../Core"
import * as Snackbar from "../Snackbar"
import * as Store from "../Store"
import * as Route from "../Route"
import * as UI from "../UI"
import * as Chess from "./Chess"
import * as ConnectFour from "./ConnectFour"
import * as Snake from "./Snake"
import * as TicTacToe from "./TicTacToe/Frontend"
import * as Rooms from "./Rooms"
import {
  FrontendModel,
  FrontendMsg,
  GameName,
  ToFrontend
} from "./Types"

//
//
//
// Model
//
//
//

export type Model = FrontendModel

//
//
//
// Init
//
//
//

export const init: [Model, Cmd.Cmd<Msg>] = [
  {
    rooms: Rooms.init,
    createRoom: RemoteData.NotAsked,
    joinRoom: RemoteData.NotAsked,
    leaveRoom: RemoteData.NotAsked
  },
  sendToBackend(['Games', ['Init']])
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
  | ["Games", ["CreateRoom", { userId: string, roomId: string }]]
  | ["Games", ["JoinRoom", { userId: string, roomId: string }]]
  | ["Games", ["LeaveRoom", { userId: string, }]]
  | ["Games", ["StartGame", { gameName: GameName, userId: string }]]


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
    case 'CreateRoom': {
      const { roomId, userId } = action[1][1]
      return [{ ...model, createRoom: RemoteData.Loading }, sendToBackend(['Games', ['CreateRoom', { roomId, userId }]])]
    }

    case 'JoinRoom': {
      const { roomId, userId } = action[1][1]
      return [{ ...model, joinRoom: RemoteData.Loading }, sendToBackend(['Games', ['JoinRoom', { roomId, userId }]])]
    }

    case 'LeaveRoom': {
      const { userId } = action[1][1]
      return [{ ...model, leaveRoom: RemoteData.Loading }, sendToBackend(['Games', ['LeaveRoom', { userId }]])]
    }

    case 'StartGame': {
      const { userId, gameName } = action[1][1]
      return [{ ...model, leaveRoom: RemoteData.Loading }, sendToBackend(['Games', ['StartGame', { userId, gameName }]])]
    }
  }
}

export const update = (
  { currentUserId }: { currentUserId: string },
  msg: Msg,
  model: Model,
): [Model, Cmd.Cmd<Msg>, OutAction[]] => {
  switch (msg[0]) {
    case 'Noop': {
      return [model, Cmd.None, []]
    }
  }
}

export const updateFromBackend = (
  msg: ToFrontend,
  model: Model,
): [Model, Cmd.Cmd<Msg>, OutAction[]] => {
  switch (msg[0]) {
    case 'Sync': {
      const userIds = Object.keys(msg[1].users)

      const action: OutAction = ['Store', ['Profile', ['FindMany', { userIds }]]]

      return [{ ...model, rooms: msg[1] }, Cmd.None, [action]]
    }

    case 'CreateRoomResulted': {
      const createRoom = pipe(msg[1], RemoteData.fromResult, RemoteData.mapSuccess(() => Unit))

      const actions: OutAction[] =
        createRoom.type === 'Failure'
          ? [['Snackbar', ['Enqueue', { variant: "Error", message: createRoom.problem }]]]
          : []


      const cmd: Cmd.Cmd<Msg> = createRoom.type === 'Success' ? Route.replace({ type: "GameRoom", }) : Cmd.None

      return [{ ...model, createRoom }, cmd, actions]
    }

    case 'LeaveRoomResulted': {
      const leaveRoom = pipe(msg[1], RemoteData.fromResult, RemoteData.mapSuccess(() => Unit))

      const actions: OutAction[] =
        leaveRoom.type === 'Failure'
          ? [['Snackbar', ['Enqueue', { variant: "Error", message: leaveRoom.problem }]]]
          : []

      return [{ ...model, leaveRoom }, Cmd.None, actions]
    }

    case 'JoinRoomResulted': {
      const joinRoom = pipe(msg[1], RemoteData.fromResult, RemoteData.mapSuccess(() => Unit))

      const actions: OutAction[] =
        joinRoom.type === 'Failure'
          ? [['Snackbar', ['Enqueue', { variant: "Error", message: joinRoom.problem }]]]
          : []


      return [{ ...model, joinRoom }, Cmd.None, actions]
    }
  }

}



//
//
//
// Subscriptions
//
//
//

export const subscriptions = (_model: Model): Sub.Sub<Msg> => {
  return Sub.None
}

//
//
//
// View
//
//
//

export const view = (
  { currentUserId, store }: { currentUserId: string; store: Store.Model },
  model: Model,
): UI.View<Msg> => {
  return () => <>game view</>
}


// 
// 
// 
// View Helpers
// 
// 
// 

export const gameToName = (game: GameName): string => {
  switch (game) {
    case "Chess":
      return "Chess"

    case "ConnectFour":
      return "Connect Four"

    case "TicTacToe":
      return "Tic Tac Toe"

    case "Snake":
      return "Snake"
  }
}

export const CoverArt = ({ game }: { game: GameName }) => {
  switch (game) {
    case "Chess":
      return <Chess.CoverArt />

    case "ConnectFour":
      return <ConnectFour.CoverArt id="connect-four-cover-art" />

    case "TicTacToe":
      return <TicTacToe.CoverArt />

    case "Snake":
      return <Snake.CoverArt />
  }
}
