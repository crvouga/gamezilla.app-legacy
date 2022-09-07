import { Cmd, Sub, tagCmd } from "../../Core";
import { BackendModel, FrontendModel, FrontendMsg, ToBackend, ToFrontend } from "./Chess.Types";
import * as UserVsUser from "./UserVsUser/UserVsUser.Frontend"
import * as Store from "../../Store"
import { UserId } from "../../Data";

//
//
//
// Model
//
//
//

export type Model = FrontendModel;

export const init = ({ sendToBackend }: { sendToBackend: (msg: ToBackend) => Cmd.Cmd<never> }): [FrontendModel, Cmd.Cmd<Msg>] => {
  const [model, cmd] = UserVsUser.init({ sendToBackend: msg => sendToBackend(['UserVsUser', msg]) })
  return [
    ['UserVsUser', model],
    tagCmd("UserVsUser", cmd)
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

export const update = ({ sendToBackend }: { sendToBackend: (msg: ToBackend) => Cmd.Cmd<never> }, msg: Msg, model: Model): [Model, Cmd.Cmd<Msg>] => {
  switch (msg[0]) {
    case 'UserVsUser': {
      if (model[0] === 'UserVsUser') {
        const [child, cmd] = UserVsUser.update({ sendToBackend: msg => sendToBackend(['UserVsUser', msg]) }, msg[1], model[1])

        return [['UserVsUser', child], tagCmd("UserVsUser", cmd)]
      }

      return [model, Cmd.None]
    }
  }
};

export const updateFromBackend = (
  msg: ToFrontend,
  model: Model,
): [Model, Cmd.Cmd<Msg>] => {
  switch (msg[0]) {
    case 'UserVsUser': {
      if (model[0] === 'UserVsUser') {
        const [child, cmd] = UserVsUser.updateFromBackend(msg[1], model[1])

        return [['UserVsUser', child], tagCmd("UserVsUser", cmd)]
      }

      return [model, Cmd.None]
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

export const subscriptions = (model: Model): Sub.Sub<Msg> => {
  return Sub.None;
};


// 
// 
// 
// View
// 
// 
// 


export const View = ({ currentUserId, store, model, dispatch }: { currentUserId: UserId.UserId, store: Store.Model, model: Model, dispatch: (msg: Msg) => void }) => {
  switch (model[0]) {
    case 'UserVsUser': {
      return <UserVsUser.View
        currentUserId={currentUserId}
        store={store}
        model={model[1]}
        dispatch={msg => dispatch(['UserVsUser', msg])}
      />
    }
  }
}


// 
// 
// 
// View Cover Art
// 
// 
// 

export const theme = {
  // lightSquare: "#EBEBD0",
  // darkSquare: "#779455",
  lightSquare: "#7C6141",
  darkSquare: "#533F30",
  pawn: "#93BA46",
}

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

// 
// 
// 
// 
// 
// 


export const mergeWithBackend = ({ frontendModel, backendModel, sendToBackend }: { sendToBackend: (msg: ToBackend) => Cmd.Cmd<never>, frontendModel: FrontendModel, backendModel: BackendModel }): [FrontendModel, Cmd.Cmd<Msg>] => {
  switch (backendModel[0]) {
    case 'UserVsUser': {
      if (frontendModel[0] === 'UserVsUser') {
        return [['UserVsUser', UserVsUser.mergeWithBackend(frontendModel[1], backendModel[1])], Cmd.None]
      }

      const [child, childCmd] = UserVsUser.init({ sendToBackend: msg => sendToBackend(['UserVsUser', msg]) })

      return [
        ['UserVsUser', UserVsUser.mergeWithBackend(child, backendModel[1])],
        tagCmd("UserVsUser", childCmd)
      ]
    }
  }
}