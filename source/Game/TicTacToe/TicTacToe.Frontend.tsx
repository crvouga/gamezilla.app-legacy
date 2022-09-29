import { Cmd, exhaustive } from "../../Core"
import { UserId } from "../../Data"
import * as Store from "../../Store"
import * as UI from "../../UI"
import * as Round from "./Round"
import { emptyBoard, PlayerType, Position, Slot, theme, toTurn, ViewBoard, ViewSlot } from "./TicTacToe"
import {
  allBestOutOf,
  allMoveTimeLimit, BackendModel, bestOutOfToString, FrontendModel,
  FrontendMsg, GameModel, GameOverModel, initSharedModel, inputBestOutOf, inputBestOutOfToString, inputMoveTimeLimit,
  inputMoveTimeLimitToString, moveTimeLimitToString, newGame, newGameToString, rematchAsk, rematchAskToString, Res, startGame,
  ToBackend,
  ToFrontend,
  toWinCount
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
  ...initSharedModel({ X: "None", O: "None" }),
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

    case 'RematchAccept':
    case 'RematchAsk':
    case 'RematchDecline':
    case 'RematchCancel':
    case 'InputBestOutOf':
    case 'InputMoveTimeLimit':
    case "InputMove":
    case "Resign":
    case "InputPlayer":
    case "StopPlaying":
    case "StartGame":
    case 'NewGame': {
      return [model, sendToBackend(msg)]
    }

    default: {
      return exhaustive(msg[0])
    }
  }
}

export const updateFromBackend = (
  msg: ToFrontend,
  model: Model,
): [Model, Cmd.Cmd<Msg>] => {
  switch (msg[0]) {
    case 'RematchAccept_Done':
    case 'RematchAsk_Done':
    case 'RematchDecline_Done':
    case 'RematchCancel_Done':
    case 'NewGame_Done':
    case 'InputMoveTimeLimit_Done':
    case 'InputBestOutOf_Done':
    case "InputMove_Done":
    case "InputPlayer_Done":
    case "StopPlaying_Done":
    case "StartGame_Done":
    case "Resign_Done": {

      const res: Res = msg

      if (res[1].type === "Err") {
        return [model, Cmd.None]
      }

      const modelNew = mergeWithBackend(model, res[1].value)

      return [{ ...modelNew, openedModal: "None" }, Cmd.None]

    }

    case 'MoveCountDown_Done':
    case 'RoundCountDown_Done': {
      if (msg[1].type === "Err") {
        return [model, Cmd.None]
      }

      const modelNew = mergeWithBackend(model, msg[1].value)

      return [modelNew, Cmd.None]
    }

    default: {
      return exhaustive(msg[0])
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
    const inputBestOutOfResult = inputBestOutOf({ bestOutOf: model.maxRoundCount, userId: currentUserId }, model)
    const inputMoveTimeLimitResult = inputMoveTimeLimit({ moveTimeLimit: model.moveTimeLimit, userId: currentUserId }, model)

    return (
      <UI.FillBox>
        <UI.Header
          left={homeButton}
          title=""
          right={roomAvatarGroup}
        />

        <UI.Box sx={{ flex: 1, overflowY: "scroll" }}>
          <BannerArt title="Tic Tac Toe" />

          <UI.Box sx={{ padding: 2 }}>
            <UI.Typography
              color="text.secondary"
              sx={{ marginBottom: 1, }}
            >
              Player One •{" "}
              <UI.Box
                component="span"
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
              <UI.ToggleButtonGroup disabled={inputBestOutOfResult.type === 'Err'} fullWidth value={model.maxRoundCount}>
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
    const currentRound = Round.toCurrent(model.round)
    const board = Round.toCurrentBoard(model.round) ?? emptyBoard

    return (
      <UI.FillBox>
        <UI.Header
          left={homeButton}
          title={toGameText({ model, store })}
          right={roomAvatarGroup}
        />

        <UI.Box sx={{ flex: 1, overflowY: "scroll" }}>
          <UI.Box sx={{ display: "flex", gap: 2, paddingX: 1, paddingY: 1 }}>
            <ViewPlayerGameSlot playerType="X" store={store} model={model} />
            <ViewPlayerGameSlot playerType="O" store={store} model={model} />
          </UI.Box>

          <UI.Box sx={{ width: "100%", position: "relative", }}>
            <ViewBoard
              board={board}
              onClick={(position) =>
                dispatch(["InputMove", { position, userId: currentUserId }])
              }
            />



            <UI.Fade in={currentRound.type === 'RoundStarting'}>
              <UI.Box
                sx={{
                  position: "absolute",
                  inset: 0,
                  background: "rgba(0, 0, 0, 0.66)",
                  display: "flex",
                  alignItems: 'center',
                  justifyContent: "center",
                  flexDirection: "column",
                  overflow: "hidden",
                  maxHeight: "100%",
                  color: "#fff"
                }}
              >
                <ViewRoundStartingMessage
                  currentUserId={currentUserId}
                  model={model}
                />
              </UI.Box>
            </UI.Fade>

          </UI.Box>
        </UI.Box>

        <UI.Box sx={{ display: "flex", width: '100%' }}>
          <ViewResignButton model={model} currentUserId={currentUserId} dispatch={dispatch} />
        </UI.Box>
      </UI.FillBox>
    )
  }

  const board = Round.toCurrentBoard(model.round) ?? emptyBoard

  const rematchAskResult = rematchAsk({ userId: currentUserId }, model)
  const newGameResult = newGame({ userId: currentUserId }, model)

  return <UI.FillBox>
    <UI.Header
      left={homeButton}
      title={toGameText({ model, store })}
      right={roomAvatarGroup}
    />

    <UI.Box sx={{ display: "flex", gap: 2, paddingX: 1, paddingY: 1 }}>
      <ViewPlayerGameSlot playerType="X" store={store} model={model} />
      <ViewPlayerGameSlot playerType="O" store={store} model={model} />
    </UI.Box>

    <UI.Box sx={{ width: "100%", position: "relative", }}>
      <ViewBoard
        board={board}
        onClick={(position) =>
          dispatch(["InputMove", { position, userId: currentUserId }])
        }
      />

      <UI.Fade in>
        <UI.Box
          sx={{
            position: "absolute",
            inset: 0,
            background: "rgba(0, 0, 0, 0.66)",
            display: "flex",
            alignItems: 'center',
            justifyContent: "center",
            flexDirection: "column",
            overflow: "hidden",
            maxHeight: "100%",
            color: "#fff"
          }}>
          <ViewGameOverMessage currentUserId={currentUserId} model={model} store={store} />
        </UI.Box>
      </UI.Fade>
    </UI.Box>

    <UI.Box sx={{ flex: 1 }} />

    <UI.Box sx={{ display: "flex", width: '100%', padding: 2, gap: 2 }}>
      <UI.Box sx={{ flex: 1 }}>
        <UI.Tooltip title={newGameToString(newGameResult)}>
          <span>
            <UI.Button
              fullWidth
              variant="outlined"
              onClick={() => dispatch(['NewGame', { userId: currentUserId }])}
              disabled={newGameResult.type === 'Err'}
            >
              Back
            </UI.Button>
          </span>
        </UI.Tooltip>
      </UI.Box>
      <UI.Box sx={{ flex: 1 }}>
        <UI.Tooltip title={model.rematch.type === 'Asking' ? "" : rematchAskToString(rematchAskResult)}>
          <span>
            <UI.Button
              disabled={rematchAskResult.type === 'Err'}
              fullWidth
              variant="contained"
              onClick={() => dispatch(['RematchAsk', { userId: currentUserId }])}
            >
              Rematch
            </UI.Button>
          </span>
        </UI.Tooltip>
      </UI.Box>
    </UI.Box>
  </UI.FillBox >
}

const ViewGameOverMessage = ({ currentUserId, model, store, }: { currentUserId: UserId.UserId, model: GameOverModel, store: Store.Model }) => {
  const isPlaying = model.O === currentUserId || model.X === currentUserId
  const score = Round.toScore(model.round)
  const winCount = toWinCount(model)

  if (model.gameOver.type === 'Resignation') {
    return (
      <>
        <UI.Box sx={{ flex: 2, display: "flex", justifyContent: 'center', alignItems: 'center', flexDirection: "column", color: "inherit" }}>
          <svg width={64} viewBox="-1 -1 2 2" color="inherit">
            <ViewSlot strokeWidth={0.33} cx={0} cy={0} r={0.8} slot={model.gameOver.resigner} color="currentColor" />
          </svg>
          <UI.Typography align="center" color="inherit" fontSize={52} sx={{ marginLeft: 2 }}>
            Resigned
          </UI.Typography>
        </UI.Box>

        <UI.Box sx={{ flex: 1, width: '100%', padding: 2 }}>
          <ViewScoreBoard score={score} winCount={winCount} />
        </UI.Box>
      </>
    )
  }


  if (model.gameOver.type === 'Tie') {
    return (
      <>
        {/* <UI.Box sx={{ flex: 1 }}></UI.Box> */}

        <UI.Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: "center", color: "inherit" }}>
          <UI.Typography fontSize={72} align="center" color="inherit">
            Tie
          </UI.Typography>
        </UI.Box>
        <UI.Box sx={{ flex: 1, width: '100%', padding: 2 }}>
          <ViewScoreBoard score={score} winCount={winCount} />
        </UI.Box>
      </>
    )
  }

  const didCurrentUserWin = model.gameOver.type === 'Winner' && model[model.gameOver.winner] === currentUserId


  return (
    <>
      <UI.Box
        sx={{
          flex: 2,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          flexDirection: "column",
          color: "inherit"
        }}>
        {isPlaying ? (
          <UI.Typography align="center" color="inherit" fontSize={64}>
            {didCurrentUserWin ? "You Won" : "You Lost"}
          </UI.Typography>
        ) : (
          <UI.Box sx={{ display: "flex", justifyContent: 'center', alignItems: 'center', flexDirection: "row" }}>
            <svg width={62} viewBox="-1 -1 2 2">
              <ViewSlot strokeWidth={0.33} cx={0} cy={0} r={0.8} slot={model.gameOver.winner} color="currentColor" />
            </svg>
            <UI.Typography align="center" color="inherit" fontSize={64} sx={{ marginLeft: 2 }}>
              Won
            </UI.Typography>
          </UI.Box>
        )}
      </UI.Box>
      <UI.Box sx={{ flex: 1, width: '100%', padding: 2 }}>
        <ViewScoreBoard score={score} winCount={winCount} />
      </UI.Box>
    </>
  )

}

export const ViewRoundStartingMessage = ({ currentUserId, model }: { currentUserId: UserId.UserId, model: GameModel }) => {
  const currentRound = Round.toCurrent(model.round)
  const previousRound = Round.toPrevious(model.round)

  if (currentRound.type === 'RoundOver') {
    return <></>
  }

  if (currentRound.type === 'RoundStarted') {
    return <></>
  }

  const score = Round.toScore(model.round)
  const winCount = toWinCount(model)

  if (previousRound.type === 'None') {
    const countDown = currentRound.countDown

    return (
      <>
        <UI.Box
          sx={{
            flex: 2,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            flexDirection: "column",
            color: "inherit"
          }}>
          <UI.Typography align="center" variant="h2" color="inherit" sx={{ marginBottom: 1 }}>
            Starting in
          </UI.Typography>
          <UI.Typography align="center" variant="h1" color="inherit" sx={{ fontSize: "4rem" }}>
            {countDown}
          </UI.Typography>
        </UI.Box>
        <UI.Box sx={{ flex: 1, color: "inherit", display: 'flex', flexDirection: "column", width: "100%" }}>
          <ViewScoreBoard score={score} winCount={winCount} />
        </UI.Box>
      </>
    )
  }


  const { roundOver } = previousRound
  const didCurrentUserWin = roundOver.type === 'Win' && model[roundOver.winner] === currentUserId
  const isPlaying = model.O === currentUserId || model.X === currentUserId


  return (
    <>
      <UI.Box sx={{ flex: 1 }}></UI.Box>
      <UI.Box
        sx={{
          flex: 2,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          flexDirection: "column",
          color: "inherit"
        }}>
        {roundOver.type === 'Tie' ? (
          <UI.Typography align="center" fontSize={54} color="inherit">
            Round Tie
          </UI.Typography>
        ) : isPlaying ? (
          <UI.Typography align="center" fontSize={54} color="inherit">
            {didCurrentUserWin ? "Round Win" : "Round Lost"}
          </UI.Typography>
        ) : (
          <UI.Box sx={{ display: "flex", justifyContent: 'center', alignItems: 'center', color: "inherit" }}>
            <svg width={64} viewBox="-1 -1 2 2" color="inherit">
              <ViewSlot strokeWidth={0.25} cx={0} cy={0} r={0.8} slot={roundOver.winner} color="currentColor" />
            </svg>
            <UI.Typography align="center" color="inherit" fontSize={64}>
              Won
            </UI.Typography>
          </UI.Box>
        )}
      </UI.Box>

      <ViewScoreBoard score={score} winCount={winCount} />

      <UI.Box sx={{ flex: 1, display: 'flex', flexDirection: "column", alignItems: 'center', justifyContent: "flex-end", padding: 4 }}>
        <UI.Typography align="center" variant="h4" color="inherit">
          Starting in {currentRound.countDown}
        </UI.Typography>
      </UI.Box>
    </>
  )
}


const ViewScoreBoard = ({ score, winCount }: { score: Round.Score, winCount: number }) => {
  const width = 52

  return (
    <UI.Box sx={{ display: "flex", width: "100%", color: "inherit", alignItems: "center", }}>
      <UI.Box sx={{ flex: 1, display: 'flex', flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 2, color: "inherit" }}>
        <svg width={width} viewBox="-1 -1 2 2" color="inherit">
          <ViewSlot strokeWidth={0.33} cx={0} cy={0} r={0.8} slot={"X"} color={"currentColor"} />
        </svg>
        <ViewScoreSlots tieCount={score.Tie} score={score.X} maxScore={winCount} slotSize={32} />
      </UI.Box>

      <UI.Box sx={{ flex: 1, display: 'flex', flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 2, color: "inherit" }}>
        <svg width={width} viewBox="-1 -1 2 2" color="inherit">
          <ViewSlot strokeWidth={0.33} cx={0} cy={0} r={0.8} slot={"O"} color={"currentColor"} />
        </svg>
        <ViewScoreSlots tieCount={score.Tie} score={score.O} maxScore={winCount} slotSize={32} />
      </UI.Box>
    </UI.Box>
  )
}

const ViewScoreSlots = ({ maxScore, score, slotSize, tieCount }: { tieCount: number; maxScore: number, score: number, slotSize: number }) => {
  return <UI.Box sx={{ display: 'flex', flexDirection: "row", alignItems: "center", justifyContent: 'center', gap: 1 / 2, color: "inherit" }}>
    {[...new Array(maxScore)].map((_, index) => {
      const n = index + 1
      return (
        <UI.Box key={index} sx={{ display: "flex", alignItems: 'center', justifyContent: "center", gap: 1, color: "inherit" }}>
          {n <= score ? (
            <UI.Icons.Circle sx={{ width: slotSize, height: slotSize, color: "inherit" }} />
          ) : n > (maxScore - tieCount) ? (
            <UI.Icons.Cancel sx={{ width: slotSize, height: slotSize, color: "inherit", opacity: 0.5 }} />
          ) : (
            <UI.Icons.CircleOutlined sx={{ width: slotSize, height: slotSize, color: "inherit", opacity: 0.5 }} />
          )}
        </UI.Box>
      )
    })}
  </UI.Box>
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



          return `${store.Profile[model[model.gameOver.resigner]]?.username ?? "..."} resigned`
        }

        case 'Winner': {

          const userId = model[model.gameOver.winner]

          return `${store.Profile[userId]?.username ?? "..."} won`
        }

        case 'Tie': {
          return `Tie`
        }
      }
    }

    case 'Game': {

      const currentRound = Round.toCurrent(model.round)

      switch (currentRound.type) {
        case 'RoundOver': {
          switch (currentRound.roundOver.type) {
            case 'Tie': {
              return "Tie"
            }

            case 'Win': {
              return `${currentRound.roundOver.winner} won`
            }
          }
        }
        case 'RoundStarted': {
          const turn = toTurn(currentRound.board)
          return `${turn} Turn`
        }

        case 'RoundStarting': {
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
  const uiTheme = UI.useTheme()

  const round = Round.toCurrent(model.round)

  const isTurn = model.type === 'Game' && round.type === 'RoundStarted' && toTurn(round.board) === playerType

  const iconSize = {
    width: 20,
    height: 20,
  }


  const timeLeft = round.type === 'RoundStarted' ? round.moveCountDown : 0

  // const progress = isTurn ? rescale({
  //   value: timeLeft,
  //   from: [0, model.moveTimeLimit],
  //   to: [0, 100]
  // }) : 0

  // const progressColor = !isTurn ? 'inherit' : timeLeft == 2 || timeLeft === 3 ? 'warning' : timeLeft === 1 ? 'error' : "inherit"

  return (
    <UI.Paper sx={{ flex: 1, overflow: "hidden", height: "100%", width: '100%' }} variant="outlined">
      <UI.Box
        sx={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          overflow: "hidden",
          borderBottom: `solid 3.5px ${isTurn ? theme.background : uiTheme.palette.divider}`,
        }}

      >
        <UI.Box sx={{ display: 'flex', flexDirection: "row", padding: 1, flex: 2, overflow: "hidden" }}>
          <UI.SvgIcon sx={{ display: "block", marginRight: 1, ...iconSize, }} viewBox="-1 -1 2 2" >
            <ViewSlot strokeWidth={0.3} color={uiTheme.palette.text.primary} slot={playerType} cx={0} cy={0} r={0.8} />
          </UI.SvgIcon>
          <UI.Avatar src={profile?.avatarUrl} sx={{ marginRight: 1, ...iconSize, }} />
          <UI.Typography noWrap sx={{ flex: 1 }}>
            {profile?.username ?? "..."}
          </UI.Typography>
        </UI.Box>
        <UI.Box>
          {isTurn && (
            <UI.Typography variant="h6" sx={{ paddingRight: 1 }} color={timeLeft === 3 ? 'warning.light' : timeLeft === 2 ? 'warning.dark' : timeLeft < 2 ? 'error.main' : 'text.primary'}>
              {timeLeft}
            </UI.Typography>
          )}
        </UI.Box>
      </UI.Box>
      {/* {isTurn ? <UI.LinearProgress key="isTurn" color={progressColor} variant="determinate" value={progress} /> : <UI.LinearProgress key="isNotTurn" color={"inherit"} variant="determinate" value={0} />} */}
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

export const BannerArt = ({ title }: { title: string }) => {
  const strokeWidth = 0.25
  return (
    <UI.AspectRatio aspectRatio={Math.pow(3 / 4, 4)}>
      <UI.Box sx={{ width: '100%', height: "100%", padding: 2, backgroundColor: theme.background, display: "flex", alignItems: 'center', justifyContent: "center", gap: 1 }}>
        <svg width="33%" viewBox="-1 -1 2 2">
          <ViewSlot strokeWidth={strokeWidth} slot="X" cx={0} cy={0} r={0.75} />
        </svg>
        <svg width="33%" viewBox="-1 -1 2 2">
          <ViewSlot strokeWidth={strokeWidth} slot="O" cx={0} cy={0} r={0.75} />
        </svg>
      </UI.Box>

      <UI.Box
        sx={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          display: 'flex',
          flexDirection: "column",
          background: `linear-gradient(rgba(0, 0, 0, 0.1), rgba(0, 0, 0, 0.4))`,
          color: "#fff",
        }}>

        <UI.Box sx={{ flex: 1 }} />

        <UI.Typography
          sx={{ paddingX: 2, paddingBottom: 1 }}
          variant="h3"
          color="inherit"
        >
          {title}
        </UI.Typography>
      </UI.Box>
    </UI.AspectRatio>
  )
}