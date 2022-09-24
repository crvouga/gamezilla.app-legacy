import { Cmd } from "../../Core"
import { UserId } from "../../Data"
import * as Store from "../../Store"
import * as UI from "../../UI"
import { emptyBoard, PlayerType, Position, Slot, theme, toStatus, toTurn, ViewBoard, ViewSlot } from "./TicTacToe"
import {
  BackendModel,
  FrontendModel,
  FrontendMsg,
  initSharedModel,
  startGame,
  ToBackend,
  ToFrontend,
  GameModel,
  allBestOutOf,
  allMoveTimeLimit,
  inputBestOutOf,
  inputMoveTimeLimit,
  inputMoveTimeLimitToString,
  inputBestOutOfToString,
  moveTimeLimitToString,
  bestOutOfToString,
  GameOverModel,
} from "./TicTacToe.Types"

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
  openedModal: "None",
}

//
//
// Update
//
//
//

export type Msg = FrontendMsg

export type OutAction = Store.Action

export const update = (
  {
    currentUserId,
    sendToBackend,
  }: {
    currentUserId: UserId.UserId
    sendToBackend: (msg: ToBackend) => Cmd.Cmd<never>
  },
  msg: Msg,
  model: Model,
): [Model, Cmd.Cmd<Msg>] => {
  switch (msg[0]) {
    //
    //
    //
    // Frontend Msg
    //
    //

    case "CloseModal": {
      return [{ ...model, openedModal: "None" }, Cmd.None]
    }

    case "OpenModal": {
      return [{ ...model, openedModal: msg[1] }, Cmd.None]
    }

    //
    //
    //
    // Request Msg
    //
    //
    //


    case 'InputBestOutOf': {
      return [model, sendToBackend(msg)]
    }

    case 'InputMoveTimeLimit': {
      return [model, sendToBackend(msg)]
    }

    case "InputMove": {
      return [model, sendToBackend(msg)]
    }

    case "Resign": {
      return [model, sendToBackend(msg)]
    }

    case "InputPlayer": {
      return [model, sendToBackend(msg)]
    }

    case "StopPlaying": {
      return [model, sendToBackend(msg)]
    }

    case "StartGame": {
      return [model, sendToBackend(msg)]
    }

    case 'NewGame': {
      return [model, sendToBackend(msg)]
    }
  }
}

export const updateFromBackend = (
  msg: ToFrontend,
  model: Model,
): [Model, Cmd.Cmd<Msg>] => {
  switch (msg[0]) {
    case 'InputMoveTimeLimit_Done': {
      if (msg[1].type === "Err") {
        return [model, Cmd.None]
      }

      const modelNew = mergeWithBackend(model, msg[1].value)

      return [modelNew, Cmd.None]
    }

    case 'InputBestOutOf_Done': {
      if (msg[1].type === "Err") {
        return [model, Cmd.None]
      }

      const modelNew = mergeWithBackend(model, msg[1].value)

      return [modelNew, Cmd.None]
    }

    case 'NewGame_Done': {
      if (msg[1].type === "Err") {
        return [model, Cmd.None]
      }

      const modelNew = mergeWithBackend(model, msg[1].value)

      return [modelNew, Cmd.None]
    }

    case "InputMove_Done": {
      if (msg[1].type === "Err") {
        return [model, Cmd.None]
      }

      const modelNew = mergeWithBackend(model, msg[1].value)

      return [modelNew, Cmd.None]
    }

    case "InputPlayer_Done": {
      if (msg[1].type === "Err") {
        return [model, Cmd.None]
      }

      const modelNew = mergeWithBackend(model, msg[1].value)

      return [modelNew, Cmd.None]
    }

    case "StopPlaying_Done": {
      if (msg[1].type === "Err") {
        return [model, Cmd.None]
      }

      const modelNew = mergeWithBackend(model, msg[1].value)

      return [modelNew, Cmd.None]
    }

    case "StartGame_Done": {
      if (msg[1].type === "Err") {
        return [model, Cmd.None]
      }

      const modelNew = mergeWithBackend(model, msg[1].value)

      return [modelNew, Cmd.None]
    }

    case "Resign_Done": {
      if (msg[1].type === "Err") {
        return [model, Cmd.None]
      }

      const modelNew = mergeWithBackend(model, msg[1].value)

      return [modelNew, Cmd.None]
    }

    case 'MoveCountDown_Done': {
      if (msg[1].type === "Err") {
        return [model, Cmd.None]
      }

      const modelNew = mergeWithBackend(model, msg[1].value)

      return [modelNew, Cmd.None]
    }

    case 'RoundCountDown_Done': {
      if (msg[1].type === "Err") {
        return [model, Cmd.None]
      }

      const modelNew = mergeWithBackend(model, msg[1].value)

      return [modelNew, Cmd.None]
    }
  }
}



export const mergeWithBackend = (
  frontendModel: FrontendModel,
  backendModel: BackendModel,
): FrontendModel => {
  return {
    ...backendModel,
    openedModal: frontendModel.openedModal,
  }
}

//
//
//
// View
//
//
//

export const View = ({
  currentUserId,
  store,
  model,
  dispatch,
  onCloseGame,
  goHome,
  roomAvatarGroup,
}: {
  currentUserId: UserId.UserId
  store: Store.Model
  model: Model
  dispatch: (msg: Msg) => void
  onCloseGame: () => void
  goHome: () => void
  roomAvatarGroup: UI.ViewNode
}) => {
  const homeButton = (
    <UI.IconButton
      sx={{ marginLeft: -1 }}
      onClick={goHome}
    >
      <UI.Icons.Home />
    </UI.IconButton>
  )


  if (model.type === "Setup") {
    const startGameResult = startGame({ userId: currentUserId }, model)
    const inputBestOutOfResult = inputBestOutOf({ bestOutOf: model.bestOutOf, userId: currentUserId }, model)
    const inputMoveTimeLimitResult = inputMoveTimeLimit({ moveTimeLimit: model.moveTimeLimit, userId: currentUserId }, model)

    return (
      <UI.FillBox>

        <UI.Header
          left={homeButton}
          title="Tic Tac Toe"
          right={roomAvatarGroup}
        />

        <UI.Box sx={{ flex: 1, padding: 2, overflowY: "scroll" }}>
          <UI.Typography
            color="text.secondary"
            sx={{ marginBottom: 1 }}
          >
            Player One •{" "}
            <UI.Box
              component="span"
              sx={{ fontFamily: "Roboto Mono" }}
            >
              X
            </UI.Box>
          </UI.Typography>

          {model.X === "None" ? (
            <UI.Button
              fullWidth
              variant="contained"
              onClick={() =>
                dispatch([
                  "InputPlayer",
                  { userId: currentUserId, playerType: "X" },
                ])
              }
            >
              Play as X
            </UI.Button>
          ) : (
            <VidePlayerSetupSlot
              currentUserId={currentUserId}
              userId={model.X}
              store={store}
              dispatch={dispatch}
            />
          )}

          <UI.Typography
            color="text.secondary"
            sx={{ marginTop: 3, marginBottom: 1 }}
          >
            Player Two •{" "}
            <UI.Box
              component="span"
              sx={{ fontFamily: "Roboto Mono" }}
            >
              O
            </UI.Box>
          </UI.Typography>

          {model.O === "None" ? (
            <UI.Button
              fullWidth
              variant="contained"
              onClick={() =>
                dispatch([
                  "InputPlayer",
                  { userId: currentUserId, playerType: "O" },
                ])
              }
            >
              Play as O
            </UI.Button>
          ) : (
            <VidePlayerSetupSlot
              currentUserId={currentUserId}
              userId={model.O}
              store={store}
              dispatch={dispatch}
            />
          )}

          <UI.Typography
            color="text.secondary"
            sx={{ marginTop: 3, marginBottom: 1 }}
          >
            Best Out Of
          </UI.Typography>

          <UI.Tooltip title={inputBestOutOfToString(inputBestOutOfResult)}>
            <UI.ToggleButtonGroup disabled={inputBestOutOfResult.type === 'Err'} fullWidth value={model.bestOutOf}>
              {allBestOutOf.map(bestOutOf => (
                <UI.ToggleButton key={bestOutOf} value={bestOutOf} onClick={() => dispatch(['InputBestOutOf', { userId: currentUserId, bestOutOf }])}>
                  {bestOutOfToString(bestOutOf)}
                </UI.ToggleButton>
              ))}
            </UI.ToggleButtonGroup>
          </UI.Tooltip>


          <UI.Typography
            color="text.secondary"
            sx={{ marginTop: 3, marginBottom: 1 }}
          >
            Move Time Limit
          </UI.Typography>

          <UI.Tooltip title={inputMoveTimeLimitToString(inputMoveTimeLimitResult)}>
            <UI.ToggleButtonGroup disabled={inputMoveTimeLimitResult.type === 'Err'} fullWidth value={model.moveTimeLimit}>
              {allMoveTimeLimit.map(moveTimeLimit => (
                <UI.ToggleButton key={moveTimeLimit} value={moveTimeLimit} onClick={() => dispatch(['InputMoveTimeLimit', { userId: currentUserId, moveTimeLimit }])}>
                  {moveTimeLimitToString(moveTimeLimit)}
                </UI.ToggleButton>
              ))}
            </UI.ToggleButtonGroup>
          </UI.Tooltip>
        </UI.Box>



        <UI.Box sx={{ padding: 2, display: "flex", gap: 2 }}>
          <UI.Button
            variant="outlined"
            fullWidth
            onClick={onCloseGame}
          >
            Close
          </UI.Button>
          <UI.Button
            variant="contained"
            fullWidth
            onClick={() => dispatch(["StartGame", { userId: currentUserId }])}
            disabled={startGameResult.type === "Err"}
          >
            Start
          </UI.Button>
        </UI.Box>
      </UI.FillBox>
    )
  }

  if (model.type === 'Game') {
    const board = model.round.type === 'RoundOver' ? model.round.board : model.round.type === 'Started' ? model.round.board : emptyBoard
    return (
      <UI.FillBox>
        <UI.Header
          left={homeButton}
          title={toGameText({ model, store })}
          right={roomAvatarGroup}
        />

        <UI.Box sx={{ display: "flex", gap: 2, paddingX: 1, paddingY: 1 }}>
          <ViewPlayerGameSlot playerType="X" store={store} model={model} />
          <ViewPlayerGameSlot playerType="O" store={store} model={model} />
        </UI.Box>

        <UI.Box sx={{ width: "100%", position: "relative" }}>
          <ViewBoard
            board={board}
            onClick={(position) =>
              dispatch(["InputMove", { position, userId: currentUserId }])
            }
          />
          {model.round.type === 'Starting' && (
            <UI.Box sx={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", background: "rgba(0, 0, 0, 0.5)", display: "flex", alignItems: 'center', justifyContent: "center", flexDirection: "column" }}>
              <UI.Box sx={{ flex: 1, display: "flex", justifyContent: "center", alignItems: "center", flexDirection: "column" }}>
                <UI.Typography align="center" variant="h6" color="text.secondary">
                  Round
                </UI.Typography>
                <UI.Typography align="center" variant="h3">
                  1 / {model.bestOutOf}
                </UI.Typography>
              </UI.Box>
              <UI.Box sx={{ flex: 1 }}>
                <UI.Typography align="center" color="text.secondary">
                  Starting in...
                </UI.Typography>
                <UI.Typography align="center" variant="h1">
                  {model.round.countDown}
                </UI.Typography>
              </UI.Box>
              <UI.Box sx={{ flex: 1 }}></UI.Box>
            </UI.Box>
          )}
        </UI.Box>

        <UI.Box sx={{ flex: 1 }} />

        <UI.Box sx={{ display: "flex", width: '100%' }}>
          <ViewResignButton model={model} currentUserId={currentUserId} dispatch={dispatch} />
        </UI.Box>
      </UI.FillBox>
    )
  }

  return <></>
}

const ViewResignButton = ({ currentUserId, model, dispatch }: { currentUserId: UserId.UserId, model: Model, dispatch: (msg: Msg) => void }) => {
  return (
    <>
      <UI.ActionButton
        icon={<UI.Icons.Flag />}
        label="Resign"
        onClick={() => dispatch(["OpenModal", "Resignation"])}
      />
      <UI.ConformationDialog
        open={model.openedModal === "Resignation"}
        onCancel={() => dispatch(["CloseModal"])}
        onClose={() => dispatch(["CloseModal"])}
        onConfirm={() => dispatch(["Resign", { userId: currentUserId }])}
        headerIcon={<UI.Icons.Flag sx={{ width: 64, height: 64 }} />}
        title="Resign from game?"
        confirmTitle="Resign"
      />
    </>
  )
}

const toGameText = ({ model, store }: { model: Model, store: Store.Model }): string => {

  switch (model.type) {
    case 'Setup': {
      return "Setting up"
    }

    case 'GameOver': {
      switch (model.gameOver.type) {
        case 'Resignation': {
          return `${store.Profile[model.gameOver.resigner]?.username ?? "..."} resigned`
        }

        case 'Winner': {
          return `${store.Profile[model.gameOver.winner]?.username ?? "..."} won`
        }
      }
    }

    case 'Game': {

      switch (model.round.type) {
        case 'RoundOver': {
          switch (model.round.gameOver.type) {
            case 'Tie': {
              return "Tie"
            }

            case 'Win': {
              return `${model.round.gameOver.winner} won`
            }
          }
        }
        case 'Started': {
          const turn = toTurn(model.round.board)
          return `${turn}'s Turn`
        }

        case 'Starting': {
          return "Starting..."
        }
      }

    }
  }

}

const VidePlayerSetupSlot = ({
  currentUserId,
  store,
  userId,
  dispatch,
}: {
  currentUserId: UserId.UserId
  userId: UserId.UserId
  store: Store.Model
  dispatch: (msg: Msg) => void
}) => {
  return (
    <UI.Box sx={{ display: "flex", alignItems: "center" }}>
      <UI.Avatar
        src={store.Profile[userId]?.avatarUrl}
        sx={{ marginRight: 1 }}
      />
      <UI.Typography sx={{ flex: 1 }}>
        {store.Profile[userId]?.username ?? "..."}
      </UI.Typography>
      {currentUserId === userId && (
        <UI.Button
          onClick={() => dispatch(["StopPlaying", { userId: currentUserId }])}
        >
          Stop Playing
        </UI.Button>
      )}
    </UI.Box>
  )
}

const ViewPlayerGameSlot = ({
  store,
  model,
  playerType,
}: {
  store: Store.Model
  model: GameModel | GameOverModel
  playerType: PlayerType
}) => {
  const userId = model[playerType]
  const profile = store.Profile[userId]
  const theme = UI.useTheme()

  const isTurn = model.round.type === 'Started' && toTurn(model.round.board) === playerType

  const iconSize = {
    width: 20,
    height: 20,
  }


  return (
    <UI.Paper
      sx={{
        flex: 1,
        display: "flex",
        alignItems: "center",
        padding: 1,
        overflow: "hidden",
        borderBottom: `solid 3px ${isTurn ? theme.palette.primary.main : theme.palette.divider}`,
      }}
      variant="outlined"
    >
      <UI.SvgIcon sx={{ display: "block", marginRight: 1, ...iconSize, }} viewBox="-1 -1 2 2" >
        <ViewSlot strokeWidth={0.3} color={theme.palette.text.primary} slot={playerType} cx={0} cy={0} r={0.8} />
      </UI.SvgIcon>
      <UI.Avatar src={profile?.avatarUrl} sx={{ marginRight: 1, ...iconSize, }} />
      <UI.Typography noWrap sx={{ flex: 1 }}>
        {profile?.username ?? "..."}
      </UI.Typography>
      {isTurn && (
        <UI.Typography sx={{ marginLeft: 1 }}>
          {model.round.type === 'Started' ? model.round.moveCountDown : 0}
        </UI.Typography>
      )}
    </UI.Paper>
  )
}
// 
// 
// 
// 
// 
//
// 

export const CoverArt = () => {
  const positions: [Position, Slot][] = [
    [{ row: 0, column: 0 }, "X"],
    [{ row: 0, column: 1 }, "Empty"],
    [{ row: 1, column: 0 }, "Empty"],
    [{ row: 1, column: 1 }, "O"],
  ]

  const LINES = [
    { x1: 1, y1: 0, x2: 1, y2: 3 },
    { x1: 0, y1: 1, x2: 3, y2: 1 },
  ] as const

  return (
    <svg
      width="100%"
      viewBox="0 0 2 2"
    >
      <rect
        x={0}
        y={0}
        width={2}
        height={2}
        fill={theme.background}
      />

      {LINES.map((line, index) => (
        <line
          key={index}
          {...line}
          stroke={theme.line}
          strokeWidth={0.1}
        />
      ))}

      {positions.map(([{ column, row }, slot], index) => (
        <ViewSlot
          key={index}
          slot={slot}
          cx={Number(column) + 0.5}
          cy={Number(row) + 0.5}
          r={0.3}
        />
      ))}
    </svg>
  )
}
