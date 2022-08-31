import { Cmd, exhaustive, pipe, Sub, tag, tagCmd } from "../../Core"
import { UserId } from "../../Data"
import * as Store from "../../Store"
import * as UI from "../../UI"
import {
  BackendModel,
  FrontendModel,
  FrontendMsg,
  ToBackend,
  ToFrontend
} from "./Chess.Types"
import * as UserVsUser from "./UserVsUser/UserVsUser.Frontend"

//
//
//
// Model
//
//
//

export type Model = FrontendModel

export const init = ({ sendToBackend }: { sendToBackend: (msg: ToBackend) => Cmd.Cmd<never> }): [FrontendModel, Cmd.Cmd<Msg>] => {
  const [child, childCmd] = UserVsUser.init({ sendToBackend: msg => sendToBackend(['UserVsUser', msg]) })
  return [
    {
      type: "UserVsUser",
      child: child
    },
    tagCmd("UserVsUser", childCmd)
  ]
}

//
//
//
// Update
//
//
//

export type Msg = FrontendMsg

export const update = (
  { sendToBackend }: { sendToBackend: (msg: ToBackend) => Cmd.Cmd<never> },
  msg: Msg,
  model: Model,
): [Model, Cmd.Cmd<Msg>] => {
  switch (msg[0]) {
    case 'UserVsUser': {
      if (model.type === 'UserVsUser') {
        const [child, childCmd] = UserVsUser.update({ sendToBackend: (msg) => sendToBackend(['UserVsUser', msg]) }, msg[1], model.child)
        return [{ type: "UserVsUser", child }, tagCmd("UserVsUser", childCmd)]
      }
      return [model, Cmd.None]
    }

    default:
      return exhaustive(msg[0])
  }
}



export const updateFromBackend = (
  msg: ToFrontend,
  model: Model,
): [Model, Cmd.Cmd<Msg>] => {
  switch (msg[0]) {
    case 'UserVsUser': {
      if (model.type === 'UserVsUser') {
        const [child, childCmd] = UserVsUser.updateFromBackend(msg[1], model.child)
        return [{ type: "UserVsUser", child }, tagCmd("UserVsUser", childCmd)]
      }
      return [model, Cmd.None]
    }

    default: {
      return exhaustive(msg[0])
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



export const view =
  (
    {
      currentUserId,
      store,
    }: {
      store: Store.Model
      currentUserId: UserId.UserId
    },
    model: Model,
  ): UI.View<Msg> => {
    switch (model.type) {
      case 'UserVsUser': {
        return pipe(UserVsUser.view({ currentUserId, store }, model.child), UI.map(tag("UserVsUser")))
      }
    }
  }



export const theme = {
  // lightSquare: "#EBEBD0",
  // darkSquare: "#779455",
  lightSquare: "#7C6141",
  darkSquare: "#533F30",
  pawn: "#93BA46",
}

// 
// 
// 
// View Cover Art
// 
// 
// 

export const CoverArt = () => {
  return (
    <svg
      width="100%"
      height="100%"
      viewBox="0 0 2 2"
    >
      <rect
        x={0}
        y={0}
        width={1}
        height={1}
        fill={theme.lightSquare}
      />

      <rect
        x={0}
        y={1}
        width={1}
        height={1}
        fill={theme.darkSquare}
      />

      <rect
        x={1}
        y={1}
        width={1}
        height={1}
        fill={theme.lightSquare}
      />

      <rect
        x={1}
        y={0}
        width={1}
        height={1}
        fill={theme.darkSquare}
      />


      <svg xmlns="http://www.w3.org/2000/svg" width="2" height="2" viewBox="0 0 45 45">
        <g transform="translate(0 -2) scale(0.8)" style={{ transformOrigin: "center" }}>
          <path
            fill={theme.pawn}
            stroke={theme.pawn}
            strokeLinecap="round"
            strokeWidth="1.5"
            d="M22.5 9c-2.21 0-4 1.79-4 4 0 .89.29 1.71.78 2.38C17.33 16.5 16 18.59 16 21c0 2.03.94 3.84 2.41 5.03-3 1.06-7.41 5.55-7.41 13.47h23c0-7.92-4.41-12.41-7.41-13.47 1.47-1.19 2.41-3 2.41-5.03 0-2.41-1.33-4.5-3.28-5.62.49-.67.78-1.49.78-2.38 0-2.21-1.79-4-4-4z"
          ></path>
        </g>
      </svg>

    </svg>
  )
}


export const mergeBackendModel = (frontendModel: FrontendModel, backendModel: BackendModel): FrontendModel => {
  switch (frontendModel.type) {
    case 'UserVsUser': {
      if (backendModel.type === 'UserVsUser') {
        return {
          type: "UserVsUser",
          child: {
            boardWidth: frontendModel.child.boardWidth,
            isFlipped: frontendModel.child.isFlipped,
            openedMenuId: frontendModel.child.openedMenuId,
            openedModal: frontendModel.child.openedModal,
            sharedModel: backendModel.child.sharedModel
          }
        }
      }
      return frontendModel
    }
  }
}