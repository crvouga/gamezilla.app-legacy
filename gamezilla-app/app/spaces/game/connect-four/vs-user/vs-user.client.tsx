import {
  GameLayout,
  ViewBottomButtonBar,
  ViewBottomButtonBarAction,
} from "gamezilla-app/app/spaces/game/@SHARED/game"
import { VsUserSetupScreen } from "gamezilla-app/app/spaces/game/@SHARED/vs-user"
import { GameClientModule } from "gamezilla-app/app/spaces/@SHARED/architecture/game-client-v2"
import {
  SpaceClientCtx,
  SpaceClientEvent,
} from "gamezilla-app/app/spaces/@SHARED/space"
import { ClientCmd, ClientCtx } from "gamezilla-app/app/@SHARED/client"
import {
  Button,
  ConfirmationDialog,
  IconArrowLeftOnRect,
  IconArrowRotateLeft,
  IconCheckmarkCircle,
  IconFlag,
  IconSpinner,
  IconXMark,
  Avatar,
} from "gamezilla-app/app/@SHARED/ui"
import { Sub } from "gamezilla-app/@SHARED/core"
import { PlayerType, toTurn } from "../@SHARED/connect-four"
import { PlayerIcon, ViewColumns } from "../@SHARED/connect-four-ui"
import { CoverArt } from "../@SHARED/connect-four-ui/connect-four-cover-art"
import {
  ModelClient,
  MsgClient,
  MsgSync,
  ModelSync,
  StateGame,
  StateGameOver,
  MsgToClient,
  MsgToServer,
  toPlayerType,
} from "./vs-user.core"

//
//
//
//
//
//
//

type Module = GameClientModule<{
  Model: ModelClient
  Msg: MsgClient
  MsgToClient: MsgToClient
  MsgToServer: MsgToServer
  ModelSync: ModelSync
  MsgSync: MsgSync
  Ctx: SpaceClientCtx & { onQuit: () => void }
  MsgInCmd: null
  MsgInEvent: SpaceClientEvent
  MsgOutCmd: ClientCmd<{
    MsgClient: MsgClient
    MsgToServer: MsgToServer
  }>
  MsgOutEvent: null
}>

//
//
//
// Model
//
//
//

const init: Module["init"] = {
  ghostIndex: null,
  openedModal: null,
}

//
//
//
// Update
//
//
//

const update: Module["update"] = (input) => {
  return GameClientModule.andThen({ model: input.model }, (model) =>
    updateFromMsg(model)(input),
  )
}

const updateFromMsg =
  (model: ModelClient): Module["update"] =>
  (input) => {
    const { msg } = input

    if (!msg) {
      return { model }
    }

    switch (msg.t) {
      case "clicked-resign": {
        return { model: { ...model, openedModal: "confirm-resign" } }
      }

      case "hovered-over-columns": {
        return { model: { ...model, ghostIndex: msg.columnIndex } }
      }

      case "close-modal": {
        return { model: { ...model, openedModal: null } }
      }

      default: {
        return {
          model,
        }
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

const subscriptions: Module["subscriptions"] = () => {
  return Sub.None
}

//
//
//
// View
//
//
//

const View: Module["View"] = (props) => {
  if (!props.model) {
    return null
  }

  switch (props.modelSync.type) {
    case "setup": {
      return (
        <VsUserSetupScreen
          ctx={props.ctx}
          title="Connect Four"
          renderCoverArt={(props) => {
            return (
              <div {...props}>
                <CoverArt />
              </div>
            )
          }}
          onStartGame={() => {
            props.dispatch({
              t: "user-started-game",
              userId: props.ctx.currentUserId,
            })
          }}
          onQuit={props.ctx.onQuit}
          playerOne={{
            label: "Red",
            onStartPlaying: () => {
              props.dispatch({
                t: "user-started-playing",
                playerType: "player-one",
                userId: props.ctx.currentUserId,
              })
            },
            onStopPlaying: () => {
              props.dispatch({
                t: "user-stopped-playing",
                userId: props.ctx.currentUserId,
              })
            },
            renderIcon: (props) => {
              return <PlayerIcon playerType="player-one" {...props} />
            },
            userId: props.modelSync.players["player-one"] ?? null,
          }}
          playerTwo={{
            label: "Yellow",
            onStartPlaying: () => {
              props.dispatch({
                t: "user-started-playing",
                userId: props.ctx.currentUserId,
                playerType: "player-two",
              })
            },
            onStopPlaying: () => {
              props.dispatch({
                t: "user-stopped-playing",
                userId: props.ctx.currentUserId,
              })
            },
            renderIcon: (props) => {
              return <PlayerIcon playerType="player-two" {...props} />
            },
            userId: props.modelSync.players["player-two"] ?? null,
          }}
        />
      )
    }

    case "game":
    case "game-over": {
      const currentUserPlayerType = toPlayerType(
        props.ctx.currentUserId,
        props.modelSync,
      )

      return (
        <GameLayout isSpectating={currentUserPlayerType === null}>
          <div className="flex w-full flex-1 flex-col items-center justify-center gap-2">
            <div className="flex w-full items-center gap-2 px-2">
              <PlayerSlot
                playerType="player-one"
                modelSync={props.modelSync}
                ctx={props.ctx}
              />
              <PlayerSlot
                playerType="player-two"
                modelSync={props.modelSync}
                ctx={props.ctx}
              />
            </div>

            <Feedback ctx={props.ctx} modelSync={props.modelSync} />

            <div className="relative w-full">
              <ViewColumns
                columns={props.modelSync.columns}
                gameId={props.modelSync.gameId}
                onDropDisc={(columnIndex) =>
                  props.dispatch({
                    t: "user-dropped-disc",
                    userId: props.ctx.currentUserId,
                    columnIndex,
                  })
                }
                onHover={(columnIndex) =>
                  props.dispatch({
                    t: "hovered-over-columns",
                    columnIndex,
                  })
                }
                disabled={
                  toTurn(props.modelSync.columns) !== currentUserPlayerType ||
                  props.modelSync.type === "game-over"
                }
              />
              {props.modelSync.type === "game-over" && (
                <div className="absolute left-0 top-0 flex h-full w-full items-center justify-center bg-black/50">
                  <ViewGameOverMessage
                    dispatch={props.dispatch}
                    ctx={props.ctx}
                    modelSync={props.modelSync}
                  />
                </div>
              )}
            </div>
          </div>

          <ViewBottomButtonBar>
            {props.modelSync.type === "game" && (
              <ViewBottomButtonBarAction
                icon={(props) => <IconFlag {...props} />}
                label="Resign"
                onClick={() => {
                  props.dispatch({
                    t: "clicked-resign",
                    userId: props.ctx.currentUserId,
                  })
                }}
              />
            )}

            {props.modelSync.type === "game-over" &&
              props.ctx.currentUserId === props.ctx.space.hostId && (
                <>
                  <ViewBottomButtonBarAction
                    icon={(props) => <IconArrowLeftOnRect {...props} />}
                    label="Exit"
                    onClick={() => {
                      props.dispatch({
                        t: "user-stopped-game",
                        userId: props.ctx.currentUserId,
                      })
                    }}
                  />

                  <ViewBottomButtonBarAction
                    icon={(props) => <IconArrowRotateLeft {...props} />}
                    label="Rematch"
                    onClick={() => {
                      props.dispatch({
                        t: "user-requested-rematch",
                        userId: props.ctx.currentUserId,
                      })
                    }}
                  />
                </>
              )}
          </ViewBottomButtonBar>

          <ConfirmationDialog
            headerIcon={<IconFlag className="h-10 w-10" />}
            title="Resign from game?"
            onCancel={() => props.dispatch({ t: "close-modal" })}
            onClose={() => props.dispatch({ t: "close-modal" })}
            confirmTitle="Resign"
            onConfirm={() =>
              props.dispatch({
                t: "user-resigned",
                userId: props.ctx.currentUserId,
              })
            }
            open={props.model.openedModal === "confirm-resign"}
          />
        </GameLayout>
      )
    }
  }
}

const ViewGameOverMessage = ({
  ctx,
  modelSync,
  dispatch,
}: {
  modelSync: StateGameOver
  ctx: ClientCtx
  dispatch: (msg: MsgSync) => void
}) => {
  const currentPlayerType = toPlayerType(ctx.currentUserId, modelSync)

  if (
    modelSync.rematch.type === "Asking" &&
    modelSync.rematch.asker === currentPlayerType
  ) {
    return (
      <>
        <p className="mb-4 text-center text-xl">Waiting for response</p>
        <IconSpinner className="mb-4 h-8 w-8 animate-spin" />
        <Button
          variant="contained"
          onClick={() =>
            dispatch({
              t: "user-cancelled-rematch",
              userId: ctx.currentUserId,
            })
          }
          text="Cancel"
        />
      </>
    )
  }

  if (
    modelSync.rematch.type === "Asking" &&
    modelSync.rematch.asker !== currentPlayerType &&
    currentPlayerType !== null
  ) {
    return (
      <>
        <p>Rematch?</p>
        <div className="flex w-full items-center justify-center gap-4">
          <Button
            variant="contained"
            onClick={() =>
              dispatch({
                t: "user-responded-to-rematch-request",
                userId: ctx.currentUserId,
                response: "Decline",
              })
            }
            start={<IconXMark className="h-6 w-6" />}
            text="Decline"
          />

          <Button
            variant="contained"
            onClick={() =>
              dispatch({
                t: "user-responded-to-rematch-request",
                userId: ctx.currentUserId,
                response: "Decline",
              })
            }
            start={<IconCheckmarkCircle className="h-6 w-6" />}
            text="Accept"
          />
        </div>
      </>
    )
  }

  if (modelSync.gameOver.type === "Draw") {
    return <p className="text-xl">Tie</p>
  }

  if (modelSync.gameOver.type === "resignation") {
    const { resigner } = modelSync.gameOver

    const winner: PlayerType =
      resigner === "player-one" ? "player-two" : "player-one"

    if (currentPlayerType === null) {
      return (
        <>
          <div className="flex w-full items-center justify-center">
            <PlayerIcon playerType={winner} />
            <Avatar
              alt=""
              src={ctx.profiles[modelSync.players[winner]]?.avatarUrl}
            />
          </div>
          <p>Winner</p>
        </>
      )
    }

    return (
      <>
        <p>{currentPlayerType === winner ? "You Won" : "You Lost"}</p>
        <p>by resignation</p>
      </>
    )
  }

  if (modelSync.gameOver.type === "Winner") {
    const { winner } = modelSync.gameOver

    if (currentPlayerType === null) {
      return (
        <div className="flex w-full flex-col items-center justify-center gap-2">
          <div className="flex w-full items-center justify-center gap-2">
            <PlayerIcon playerType={winner} className="h-20 w-20" />
            <Avatar
              className="h-20 w-20"
              src={ctx.profiles[modelSync.players[winner]]?.avatarUrl}
            />
          </div>
          <p>Winner</p>
        </div>
      )
    }

    return <p>{currentPlayerType === winner ? "You Won" : "You Lost"}</p>
  }

  return null
}

const Feedback = ({
  ctx,
  modelSync,
}: {
  ctx: SpaceClientCtx
  modelSync: StateGame | StateGameOver
}) => {
  if (modelSync.type === "game-over") {
    return (
      <p className="flex items-center justify-center text-neutral-300">
        Game Over
      </p>
    )
  }

  const turn = toTurn(modelSync.columns)

  const currentUserPlayerType = toPlayerType(ctx.currentUserId, modelSync)

  if (currentUserPlayerType !== turn) {
    return (
      <p className="flex items-center justify-center gap-2 text-center text-neutral-300">
        <PlayerIcon className="h-4 w-4" playerType={turn} />
        Turn
      </p>
    )
  }

  return (
    <p className="flex items-center justify-center gap-2 text-center">
      <PlayerIcon className="h-4 w-4" playerType={turn} />
      Your Turn
    </p>
  )
}

const PlayerSlot = ({
  modelSync,
  playerType,
  ctx,
}: {
  modelSync: StateGame | StateGameOver
  playerType: PlayerType
  ctx: SpaceClientCtx
}) => {
  return (
    <div className="flex flex-1 items-center gap-2 overflow-hidden rounded border border-neutral-700 p-2">
      <PlayerIcon className="h-8 w-8" playerType={playerType} />
      <Avatar
        className="h-8 w-8"
        alt=""
        src={ctx.profiles[modelSync.players[playerType]]?.avatarUrl}
      />
      <p className="text-neutral-300">
        {ctx.profiles[modelSync.players[playerType]]?.username ?? "..."}
      </p>
    </div>
  )
}

const ViewFeedItem: Module["ViewFeedItem"] = () => {
  return null
}

export const VsUser: Module = {
  init,
  update,
  subscriptions,
  View,
  ViewFeedItem,
}
