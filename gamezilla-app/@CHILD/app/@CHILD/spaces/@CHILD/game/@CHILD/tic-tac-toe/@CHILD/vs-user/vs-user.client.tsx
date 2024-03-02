import { VsUserSetupScreen } from "gamezilla/@CHILD/app/@CHILD/spaces/@CHILD/game/@SHARED/vs-user"
import { SpaceClientCtx } from "gamezilla/@CHILD/app/@CHILD/spaces/@SHARED/space"
import { ClientCmd, sendToServer } from "gamezilla/@CHILD/app/@SHARED/client"
import { toTurn } from "../../@SHARED/tic-tic-toe/tic-tac-toe"
import {
  CoverArt,
  PlayerTypeIcon,
} from "../../@SHARED/tic-tic-toe/tic-tac-toe-ui"
import * as Round from "./vs-user-round"
import {
  ModelClient,
  MsgClient,
  Res,
  ModelServer,
  MsgToClient,
  MsgToServer,
  initCoreModel,
} from "./vs-user.core"

//
//
//
// Model
//
//
//

export const init: ModelClient = {
  ...initCoreModel({ X: "none", O: "none" }),
  openedModal: "none",
}

//
//
// Update
//
//
//

export const update = (
  msg: MsgClient,
  model: ModelClient,
): {
  model: ModelClient
  msgCmd?: ClientCmd<{ MsgToServer: MsgToServer; MsgClient: MsgClient }>[]
} => {
  switch (msg[0]) {
    //
    //
    // Client Msg
    //
    //

    case "close-modal": {
      return { model: { ...model, openedModal: "none" } }
    }

    case "OpenModal": {
      return { model: { ...model, openedModal: msg[1] } }
    }

    //
    //
    //
    // Request Msg
    //
    //
    //

    case "RematchAccept":
    case "RematchAsk":
    case "RematchDecline":
    case "Rematch_Cancel":
    case "InputBestOutOf":
    case "input-move":
    case "resign":
    case "InputPlayer":
    case "stop-playing":
    case "start-game":
    case "NewGame": {
      return { model, msgCmd: [sendToServer(msg)] }
    }

    default: {
      return { model }
    }
  }
}

export const updateFromServer = (
  _: { ctx: SpaceClientCtx },
  msg: MsgToClient,
  model: ModelClient,
): [ModelClient] => {
  switch (msg[0]) {
    case "player-left": {
      const modelNew = mergeWithServer(model, msg[1])
      return [modelNew]
    }

    case "RematchAccept_Done":
    case "RematchAsk_Done":
    case "Rematch_Cancel_Done":
    case "NewGame_Done":
    case "InputBestOutOf_Done":
    case "input-move-done":
    case "InputPlayer_Done":
    case "StopPlaying_Done":
    case "StartGame_Done":
    case "RematchDecline_Done":
    case "resign_Done": {
      const res: Res = msg

      if (res[1].t === "err") {
        return [model]
      }

      const modelNew = mergeWithServer(model, res[1].value)

      return [{ ...modelNew, openedModal: "none" }]
    }

    case "MoveCountDown_Done":
    case "RoundCountDown_Done": {
      if (msg[1].t === "err") {
        return [model]
      }

      const modelNew = mergeWithServer(model, msg[1].value)

      return [modelNew]
    }

    default: {
      return [model]
    }
  }
}

export const mergeWithServer = (
  clientModel: ModelClient,
  serverModel: ModelServer,
): ModelClient => {
  return {
    ...serverModel,
    openedModal: clientModel.openedModal,
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
  ctx,
  model,
  dispatch,
  onCloseGame,
}: {
  ctx: SpaceClientCtx
  model: ModelClient
  dispatch: (msg: MsgClient) => void
  onCloseGame: () => void
}) => {
  if (model.type === "setup") {
    return (
      <VsUserSetupScreen
        ctx={ctx}
        onQuit={onCloseGame}
        onStartGame={() =>
          dispatch(["start-game", { userId: ctx.currentUserId }])
        }
        renderCoverArt={(props) => {
          return (
            <div {...props}>
              <CoverArt />
            </div>
          )
        }}
        title={"Tic-Tac-Toe"}
        canStartGame={model.X !== "none" && model.O !== "none"}
        playerOne={{
          label: "Cross",
          userId: model.X === "none" ? null : model.X,
          renderIcon: (props) => {
            return <PlayerTypeIcon playerType="X" {...props} />
          },
          onStartPlaying: () => {
            dispatch([
              "InputPlayer",
              { playerType: "X", userId: ctx.currentUserId },
            ])
          },
          onStopPlaying: () => {
            dispatch([
              "InputPlayer",
              { playerType: "X", userId: ctx.currentUserId },
            ])
          },
        }}
        playerTwo={{
          label: "Naught",
          userId: model.O === "none" ? null : model.O,
          renderIcon: (props) => {
            return <PlayerTypeIcon playerType="O" {...props} />
          },
          onStartPlaying: () => {
            dispatch([
              "InputPlayer",
              { playerType: "O", userId: ctx.currentUserId },
            ])
          },
          onStopPlaying: () => {
            dispatch([
              "InputPlayer",
              { playerType: "O", userId: ctx.currentUserId },
            ])
          },
        }}
      />
    )
  }

  if (model.type === "game") {
    return <div></div>
  }

  return <div></div>
}

export const toGameText = ({ model }: { model: ModelClient }): string => {
  switch (model.type) {
    case "setup": {
      return "Setting up"
    }

    case "game-over": {
      switch (model.gameOver.type) {
        case "resignation": {
          return `Resigned`
        }

        case "Winner": {
          // const userId = model[model.gameOver.winner];

          return `won`
        }

        case "Tie": {
          return `Tie`
        }

        default: {
          return "Game Over"
        }
      }
    }

    case "game": {
      const currentRound = Round.toCurrent(model.round)

      switch (currentRound.type) {
        case "RoundOver": {
          switch (currentRound.roundOver.type) {
            case "Tie": {
              return "Tie"
            }

            case "Win": {
              return `${currentRound.roundOver.winner} won`
            }

            default: {
              return "Round Over"
            }
          }
        }
        case "RoundStarted": {
          const turn = toTurn(currentRound.board)
          return `${turn} Turn`
        }

        case "RoundStarting": {
          return "Starting..."
        }

        default: {
          return "Starting..."
        }
      }
    }
  }
}

//
//
//
//
//
//
//
