import { useLayoutEffect, useRef } from "react"
import { Cmd, exhaustive, Keyboard, Option, Result, Sub } from "../../Core"
import { UserId } from "../../Data"
import * as Route from "../../Route"
import * as Snackbar from "../../Snackbar"
import * as Store from "../../Store"
import * as UI from "../../UI"
import * as Direction from "./Direction"
import * as Joystick from "./Joystick"
import * as Position from "./Position"
import * as Snake from "./Snake"
import {
  BackendModel, canStartGame,
  FrontendModel,
  FrontendMsg, initSharedModel,
  SharedModel,
  ToBackend,
  ToFrontend
} from "./Snake.Types"

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
  openedMenuId: Option.None
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
  {
    sendToBackend,
    currentUserId,
  }: {
    sendToBackend: (msg: ToBackend) => Cmd.Cmd<never>
    currentUserId: UserId.UserId
  },
  msg: Msg,
  _model: Model,
): [Model, Cmd.Cmd<Msg>] => {

  const model: Model = { ..._model, openedMenuId: Option.None }

  switch (msg[0]) {
    case "ClickedBack":
      return [model, Route.back]

    case "PressedKeyDown": {
      if (model.gameStatus.type !== 'GameStarted') {
        return [model, Cmd.None]
      }

      if (model.gameStatus.player[1] !== currentUserId) {
        return [model, Cmd.None]
      }

      const direction = Direction.fromKey(msg[1])

      const changeDirectionCmd =
        direction.type === "Some"
          ? sendToBackend([
            "InputDirection",
            { userId: currentUserId, direction: direction.value },
          ])
          : Cmd.None

      const toggleStatusCmd =
        msg[1] === "Space"
          ? sendToBackend([
            "ToggleStatus",
            { userId: currentUserId },
          ])
          : Cmd.None

      return [model, Cmd.batch([changeDirectionCmd, toggleStatusCmd])]
    }

    case "ToggleStatus": {
      return [model, sendToBackend(msg)]
    }

    case "InputPlayer": {
      return [model, sendToBackend(msg)]
    }

    case 'InputDirection': {
      return [model, sendToBackend(msg)]
    }

    case 'StartGame': {
      return [model, sendToBackend(msg)]
    }

    case 'OpenedMenu': {
      return [{ ...model, openedMenuId: Option.Some(msg[1]) }, Cmd.None]
    }

    case 'ClosedMenu': {
      return [{ ...model, openedMenuId: Option.None }, Cmd.None]
    }

    default:
      return exhaustive(msg[0])
  }
}

export const updateFromBackend = (
  msg: ToFrontend,
  model: Model,
): [Model, Cmd.Cmd<Msg>, OutAction[]] => {
  switch (msg[0]) {
    case "Sync": {
      const sharedModel = msg[1]
      return [
        {
          ...sharedModel,
          openedMenuId: model.openedMenuId
        },
        Cmd.None,
        []
      ]
    }

    case "InputDirection_Done": {
      return updateResponse(msg[1], model)
    }

    case "ToggleStatus_Done": {
      return updateResponse(msg[1], model)
    }

    case "InputPlayer_Done": {
      return updateResponse(msg[1], model)
    }

    case 'StartGame_Done': {
      return updateResponse(msg[1], model)
    }
  }
}

const updateResponse = <
  TProblem extends string,
  TResult extends Result.Result<TProblem, SharedModel>,
>(
  result: TResult,
  model: Model,
): [Model, Cmd.Cmd<Msg>, OutAction[]] => {
  if (result.type === "Err") {
    const message = result.error.split("_").join(" ")
    return [model, Cmd.None, [["Snackbar", { message, variant: "Error" }]]]
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


export const subscriptions = (intervalId: string, model: Model): Sub.Sub<Msg> => {
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
  color: "text.secondary",
}

const buttonSx: UI.Sx = {
  border: "1px solid #ddd",
}

const upDown: UI.Sx = {
  ...buttonSx,
  width: 64,
  height: 64,
  color: "text.secondary",
}

const leftRight: UI.Sx = {
  ...buttonSx,
  width: 64,
  height: 128,
  color: "text.secondary",
}

export const View =
  (
    {
      currentUserId,
      store,
      model,
      dispatch
    }: {
      currentUserId: UserId.UserId,
      store: Store.Model
      model: Model,
      dispatch: (msg: Msg) => void
    },
  ) => {
    if (model.gameStatus.type === 'GameSetup') {
      const menuAnchorId = "playerSlotMenuId"
      return (
        <UI.FillBox >
          <UI.Typography

            sx={{ paddingX: 2 }}
            color="text.secondary"
          >
            Snake
          </UI.Typography>


          <UI.Box sx={{ height: "48px", display: "flex", alignItems: "center", width: "100%" }}>
            {model.gameStatus.player.type === 'None' ? (
              <UI.Box sx={{ padding: 2, width: "100%" }}>
                <UI.Button
                  variant="contained"
                  fullWidth
                  onClick={() =>
                    dispatch(["InputPlayer", Option.Some(["User", currentUserId])])
                  }
                >
                  Play as Snake
                </UI.Button>
              </UI.Box>
            ) : (
              <>
                <UI.ListItemButton id={menuAnchorId} onClick={() => dispatch(['OpenedMenu', menuAnchorId])}>
                  <UI.ListItemAvatar>
                    <UI.Avatar src={store.Profile[model.gameStatus.player.value[1]]?.avatarUrl} />
                  </UI.ListItemAvatar>
                  <UI.ListItemText primary={store.Profile[model.gameStatus.player.value[1]]?.username} />
                  <UI.ListItemSecondaryAction>
                    <UI.Icons.MoreVert />
                  </UI.ListItemSecondaryAction>
                </UI.ListItemButton>
                <UI.Menu
                  open={model.openedMenuId.type === 'Some' && model.openedMenuId.value === menuAnchorId}
                  onClose={() => dispatch(['ClosedMenu',])}
                  anchorEl={document.getElementById(menuAnchorId)}
                >
                  <UI.Button size="large" fullWidth onClick={() => dispatch(['InputPlayer', Option.None])}>
                    Stop Playing
                  </UI.Button>
                </UI.Menu>
              </>
            )}
          </UI.Box>

          <UI.Box sx={{ flex: 1 }} />

          <UI.Box sx={{ padding: 2 }}>
            <UI.Button
              variant="contained"
              fullWidth
              disabled={!canStartGame(model)}
              onClick={() => {
                dispatch(['StartGame'])
              }}
            >
              Start Game
            </UI.Button>
          </UI.Box>

        </UI.FillBox>
      )
    }

    return (
      <UI.FillBox>
        <ViewBoard
          model={model}
          dispatch={dispatch}
        />
        {model.gameStatus.player[1] === currentUserId && (
          <UI.Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", width: "100%", paddingBottom: 2 }}>
            <Joystick.ViewJoystick onMove={(moveEvent) => {
              dispatch(['InputDirection', { userId: currentUserId, direction: joystickDirectionToDirection(moveEvent.direction) }])
            }} />
          </UI.Box>
        )}
        {/* {model.gameStatus.player[1] === currentUserId && (
            <UI.Box sx={{ display: "flex", alignItems: "center", width: "100%" }}>
              <UI.Box
                sx={{
                  flex: 1,
                  display: "flex",
                  flexDirection: "row",
                  justifyContent: "center",
                }}
              >
                <UI.ButtonBase
                  sx={leftRight}
                  onMouseDown={() => dispatch(["InputDirection", { direction: "left", userId: currentUserId }])}
                >
                  <UI.Icons.KeyboardArrowLeft sx={iconSx} />
                </UI.ButtonBase>

                <UI.Box sx={{ display: "flex", flexDirection: "column" }}>
                  <UI.ButtonBase
                    sx={upDown}
                    onMouseDown={() => dispatch(["InputDirection", { direction: "up", userId: currentUserId }])}
                  >
                    <UI.Icons.KeyboardArrowUp sx={iconSx} />
                  </UI.ButtonBase>

                  <UI.ButtonBase
                    sx={upDown}
                    onMouseDown={() => dispatch(["InputDirection", { direction: "down", userId: currentUserId }])}
                  >
                    <UI.Icons.KeyboardArrowDown sx={iconSx} />
                  </UI.ButtonBase>
                </UI.Box>

                <UI.ButtonBase
                  sx={leftRight}
                  onMouseDown={() => dispatch(["InputDirection", { direction: "right", userId: currentUserId }])}
                >
                  <UI.Icons.KeyboardArrowRight sx={iconSx} />
                </UI.ButtonBase>
              </UI.Box>
            </UI.Box>
          )} */}
      </UI.FillBox>
    )
  }

export const joystickDirectionToDirection = (direction: Joystick.Direction): Direction.Direction => {
  switch (direction) {
    case 'Down': {
      return 'down'
    }

    case 'Left': {
      return 'left'
    }

    case 'Right': {
      return 'right'
    }

    case 'Up': {
      return 'up'
    }
  }
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

const toViewBox = ({ lower, upper }: Snake.Model["bounds"]) =>
  [lower.x, lower.y, upper.x, upper.y].join(", ")

export const CoverArt = () => {
  const bounds: Snake.Model["bounds"] = {
    lower: {
      x: 0,
      y: 0,
    },
    upper: {
      x: 4,
      y: 4,
    },
  }

  const tail: Snake.Model["tail"] = [
    { x: 0, y: 1 },
    { x: 1, y: 1 },
  ]

  const food: Snake.Model["food"] = { x: 2, y: 2 }

  return (
    <svg
      width="100%"
      viewBox={toViewBox(bounds)}
    >
      {Position.range(bounds).map(({ x, y }, index) => (
        <rect
          key={`${x} ${y} ${index}`}
          x={x}
          y={y}
          width={1}
          height={1}
          fill={Snake.theme[Snake.toTileVariant({ x, y })]}
          stroke="none"
        />
      ))}

      {tail.map(({ x, y }, index) => (
        <rect
          key={`${x} ${y} ${index}`}
          x={x}
          y={y}
          width={1}
          height={1}
          fill={Snake.theme.snake}
          stroke="none"
        />
      ))}

      {[food].map(({ x, y }, index) => (
        <rect
          key={`${x} ${y} ${index}`}
          x={x}
          y={y}
          width={1}
          height={1}
          fill={Snake.theme.apple}
          stroke="none"
        />
      ))}
    </svg>
  )
}


export const mergeWithBackend = (frontendModel: FrontendModel, backendModel: BackendModel): FrontendModel => {
  return {
    ...backendModel,
    openedMenuId: frontendModel.openedMenuId,
  }
}