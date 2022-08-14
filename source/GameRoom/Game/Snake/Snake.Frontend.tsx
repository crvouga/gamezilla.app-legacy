import { useLayoutEffect, useRef } from "react"
import * as Bridge from "../../../Bridge"
import {
  Cmd,
  exhaustive,
  Keyboard, Result,
  Sub
} from "../../../Core"
import { RoomId, UserId } from "../../../Data"
import { Snake } from "../../../Game"
import * as Route from "../../../Route"
import * as Snackbar from "../../../Snackbar"
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

export const init: Model = initSharedModel

// 
// 
// 
// Bridge
// 
// 
// 

export const sendToBackend = (roomId: RoomId.RoomId, toBackend: ToBackend) => {
  return Bridge.sendToBackend(['GameRoom', ['Game', { roomId, toBackend: ['Snake', toBackend] }]])
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

export const update = (
  { currentRoomId, currentUserId }: { currentRoomId: RoomId.RoomId, currentUserId: UserId.UserId },
  msg: Msg,
  model: Model
): [Model, Cmd.Cmd<Msg>] => {
  switch (msg[0]) {
    case 'ClickedDirection': {
      return [
        model,
        sendToBackend(currentRoomId, ['ChangeDirection', { userId: currentUserId, direction: msg[1] }])]
    }

    case "ClickedBack":
      return [model, Route.back]

    case "PressedKeyDown": {
      const direction = Snake.Direction.fromKey(msg[1])

      const changeDirectionCmd = direction.type === 'Some'
        ? sendToBackend(currentRoomId, ['ChangeDirection', { userId: currentUserId, direction: direction.value }])
        : Cmd.None

      const toggleStatusCmd = msg[1] === 'Space'
        ? sendToBackend(currentRoomId, ['ToggleStatus', { userId: currentUserId }])
        : Cmd.None

      return [model, Cmd.batch([changeDirectionCmd, toggleStatusCmd])]
    }


    case "ToggleStatus": {
      return [model, sendToBackend(currentRoomId, msg)]
    }

    case 'ChangePlayer': {
      return [model, sendToBackend(currentRoomId, msg)]
    }

    default:
      return exhaustive(msg[0])
  }
}

export const updateFromBackend = (msg: ToFrontend, model: Model): [Model, Cmd.Cmd<Msg>, OutAction[]] => {
  switch (msg[0]) {
    case 'Sync': {
      const sharedModel = msg[1]
      return [sharedModel, Cmd.None, []]
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

const handleResult = <TProblem extends string, TResult extends Result.Result<TProblem, SharedModel>>(result: TResult, model: Model): [Model, Cmd.Cmd<Msg>, OutAction[]] => {
  if (result.type === 'Err') {
    const message = result.error.split("_").join(" ")
    return [model, Cmd.None, [['Snackbar', { message, variant: "Error" }]]]
  }
  const sharedModel = result.value
  return [{ ...model, ...sharedModel }, Cmd.None, []]
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

const iconSx: UI.Sx = {
  width: 40,
  height: 40,
  color: "text.secondary"
}

const buttonSx: UI.Sx = {
  border: "1px solid #ddd",
}

const upDown: UI.Sx = {
  ...buttonSx,
  width: 64,
  height: 64,
  color: "text.secondary"
}

const leftRight: UI.Sx = {
  ...buttonSx,
  width: 64,
  height: 128,
  color: "text.secondary"
}


export const view =
  ({ currentUserId }: { currentUserId: UserId.UserId }, model: Model): UI.View<Msg> =>
    (dispatch) => {

      if (model.player[0] === 'None') {
        return <UI.FillBox>
          <UI.Box sx={{ paddingX: 2 }}>
            <UI.Typography variant='h4' sx={{ marginBottom: 1 }}>
              Snake
            </UI.Typography>
            <UI.Button variant="contained" fullWidth onClick={() => dispatch(['ChangePlayer', { player: ['User', currentUserId] }])}>
              Start Game
            </UI.Button>
          </UI.Box>
        </UI.FillBox>
      }

      return (
        <UI.FillBox>
          <ViewBoard
            model={model}
            dispatch={dispatch}
          />




          {model.player[1] === currentUserId &&
            <UI.Box sx={{ display: "flex", alignItems: "center", width: '100%' }}>

              <UI.Box sx={{ flex: 1, display: 'flex', flexDirection: "row", justifyContent: 'center' }}>
                <UI.ButtonBase
                  sx={leftRight}
                  onClick={() => dispatch(['ClickedDirection', 'left'])}>
                  <UI.Icons.KeyboardArrowLeft sx={iconSx} />
                </UI.ButtonBase>

                <UI.Box sx={{ display: "flex", flexDirection: "column", }}>
                  <UI.ButtonBase sx={upDown}
                    onClick={() => dispatch(['ClickedDirection', 'up'])}>
                    <UI.Icons.KeyboardArrowUp sx={iconSx} />
                  </UI.ButtonBase>

                  <UI.ButtonBase sx={upDown}
                    onClick={() => dispatch(['ClickedDirection', 'down'])}>
                    <UI.Icons.KeyboardArrowDown sx={iconSx} />
                  </UI.ButtonBase>

                </UI.Box>

                <UI.ButtonBase sx={leftRight}
                  onClick={() => dispatch(['ClickedDirection', 'right'])}>
                  <UI.Icons.KeyboardArrowRight sx={iconSx} />
                </UI.ButtonBase>

              </UI.Box>

            </UI.Box>}

        </UI.FillBox >
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
          userSelect: "none",
          width: "100%",
          height: "100%",
          maxHeight: "100%",
          minHeight: "100%",
        }}
        ref={ref}
      />
    </UI.Box>
  )
}


