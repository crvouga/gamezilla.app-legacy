import { useLayoutEffect, useRef } from "react"
import * as Bridge from "../../../Bridge"
import {
  Cmd,
  exhaustive,
  Keyboard,
  Option,
  Result,
  Sub
} from "../../../Core"
import { RoomId, UserId } from "../../../Data"
import * as Snackbar from "../../../Snackbar"
import { Snake } from "../../../Games"
import * as Route from "../../../Route"
import * as UI from "../../../UI"
import { FrontendModel, FrontendMsg, initSharedModel, SharedModel, ToBackend, ToFrontend } from "./Snake.Types"

//
//
//
// Model
//
//
//

export type Model = FrontendModel

export const init: Model = {
  ...initSharedModel,
  mouseStatus: "Inactive",
  touched: Option.None
}

// 
// 
// 
// Bridge
// 
// 
// 

export const sendToBackend = (roomId: RoomId.RoomId, toBackend: ToBackend) => {
  return Bridge.sendToBackend(['GameRoom', ['Game', [roomId, ['Snake', toBackend]]]])
}

//
//
//
// Update
//
//
//

export type Msg = FrontendMsg

export type OutAction = Snackbar.Action

export const update = ({currentRoomId, currentUserId}: {currentRoomId: RoomId.RoomId, currentUserId: UserId.UserId}, msg: Msg, model: Model): [Model, Cmd.Cmd<Msg>] => {
  switch (msg[0]) {
    case "ClickedRestart":
      return [init, Cmd.None]

    case "ClickedBack":
      return [model, Route.back]

    case "MouseUpBoard":
      return [model, Cmd.None]
      
    case "MouseDownBoard":
      return [model, Cmd.None]
      
    case "PressedKeyDown": {
      const direction = Snake.Direction.fromKey(msg[1])
      
      const changeDirectionCmd = direction.type === 'Some'
        ?  sendToBackend(currentRoomId, ['ChangeDirection', {userId: currentUserId, direction: direction.value}]) 
        : Cmd.None 

      const toggleStatusCmd = msg[1] === 'Space' 
        ? sendToBackend(currentRoomId, ['ToggleStatus', {userId: currentUserId}]) 
        : Cmd.None

      return [model, Cmd.batch([changeDirectionCmd, toggleStatusCmd])]
    }


    case "ToggleStatus":{
      return [model, sendToBackend(currentRoomId, msg)]
    }


    case 'ChangePlayer': {
      return [model, sendToBackend(currentRoomId, msg)]
    }

    case "AudioFailed":
      return [model, Cmd.None]

    case "AudioSucceeded":
      return [model, Cmd.None]

    case "MouseMovedBoard":
    case "TouchMoveBoard":
      return [model, Cmd.None]
      // const previous = model.touched

      // if (!previous) {
      //   return [{ ...model, touched: msg[1] }, Cmd.None]
      // }

      // const touchedNew = msg[1]

      // const delta = Position.subtract(previous, touchedNew)

      // const maxDeltaMagnitude = Math.max(Math.abs(delta.x), Math.abs(delta.y))

      // if (maxDeltaMagnitude < 4) {
      //   return [{ ...model, touched: touchedNew }, Cmd.None]
      // }

      // const xDirection = delta.x > 0 ? "left" : "right"

      // const yDirection = delta.y > 0 ? "up" : "down"

      // const directionFromSwipe =
      //   Math.abs(delta.x) > Math.abs(delta.y) ? xDirection : yDirection

      // return [
      //   enqueueDirection(directionFromSwipe, {
      //     ...model,
      //     touched: touchedNew,
      //   }),
      //   Cmd.None,
      // ]

    default:
      return exhaustive(msg[0])
  }
}

export const updateFromBackend = (msg: ToFrontend, model: Model): [Model, Cmd.Cmd<Msg>, OutAction[]] => {
  switch(msg[0]) {
    case 'Sync': {
      const sharedModel = msg[1]
      return [{...model, ...sharedModel}, Cmd.None, []]
    }

    case 'ChangeDirectionResulted': {
      return handleResult(msg[1], model)
    }

    case 'ToggleStatusResulted': {
      return handleResult(msg[1], model)
    }

    case "ChangePlayerResulted": {
      return handleResult(msg[1], model)
    }
  }
}

const handleResult = <TProblem extends string,TResult extends Result.Result<TProblem, SharedModel>>(result: TResult, model: Model): [Model, Cmd.Cmd<Msg>, OutAction[]] => {
  if(result.type === 'Err') {        
    const message = result.error.split("_").join(" ")
    return [model, Cmd.None ,[['Snackbar',["Error", {message, }]]]]
  }
  const sharedModel = result.value
  return [{...model, ...sharedModel}, Cmd.None, []]
}

//
//
//
// Subscriptions
//
//
//

export const subscriptions = (model: Model): Sub.Sub<Msg> => {
  return Keyboard.keyDowns<Msg>((key) => ["PressedKeyDown", key])
}



//
//
//
// View
//
//
//

export const view =
  ({currentUserId}: {currentUserId: UserId.UserId},model: Model): UI.View<Msg> =>
  (dispatch) => {

    if(model.player[0] === 'None') {
      return <UI.FillBox sx={{paddingX:2}}>
        <UI.Typography variant="h6">
          Player
        </UI.Typography>
        <UI.Button fullWidth variant="contained" onClick={() => dispatch(['ChangePlayer', {player: ['User', currentUserId]}])}>
          Start Playing
        </UI.Button>
      </UI.FillBox>
    }

    return (
      <UI.FillBox>
        <ViewBoard
          model={model}
          dispatch={dispatch}
        />
        <UI.Toolbar>
          <UI.Button variant="outlined" sx={{marginLeft: -1}} startIcon={model.status === 'Paused' ? <UI.Icons.PlayArrow /> : <UI.Icons.Pause /> } onClick={() => dispatch(['ToggleStatus', {userId: currentUserId}])}>
            {model.status ===  "Paused" ? "Play" : "Pause"}
          </UI.Button>
        </UI.Toolbar>
      </UI.FillBox>
    )
  }

export const ViewBoard = ({
  model,
  dispatch,
}: {
  model: Model
  dispatch: (msg: Msg) => void
}) => {
  const ref = useRef<HTMLCanvasElement | null>(null)

  useLayoutEffect(() => {
    const canvas = ref.current
    const ctx = canvas?.getContext("2d")

    if (canvas && ctx) {
      const dpi = 1000
      ctx.scale(dpi, dpi)

      const width = canvas.width
      const height = canvas.height

      Snake.draw({ width, height }, model, ctx)
    }
  }, [model])

  return (
    <UI.Box sx={{ flex: 1, width: "100%", userSelect: "none" }}>
      <canvas
        style={{
          // cursor: model.mouseStatus === "active" ? "grabbing" : "grab",
          userSelect: "none",
          width: "100%",
          height: "100%",
          maxHeight: "100%",
          minHeight: "100%",
        }}
        ref={ref}
        onMouseDown={() => {
          dispatch(["MouseDownBoard"])
        }}
        onMouseUp={() => {
          dispatch(["MouseUpBoard"])
        }}
        onMouseMove={(event) => {
          // if (model.mouseStatus === "active") {
          //   const x = event.clientX
          //   const y = event.clientY
          //   dispatch(["MouseMovedBoard", { x, y }])
          // }
        }}
        onClick={() => {}}
        onTouchMove={(event) => {
          const touch = event.touches[0]
          if (touch) {
            const x = touch.clientX
            const y = touch.clientY
            dispatch(["TouchMoveBoard", { x, y }])
          }
        }}
      />
    </UI.Box>
  )
}


