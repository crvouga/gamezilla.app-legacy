import { Eff, RemoteResult, Sub, isErr } from "gamezilla-app/@shared/core"
import {
  APP_SOUND,
  ClientCmd,
  playSound,
  preloadSound,
  sendToServer,
} from "gamezilla-app/app/@shared/client"
import { IconPuzzlePiece } from "gamezilla-app/app/@shared/ui"
import { GameClient } from "gamezilla-app/app/spaces/@shared/architecture/game-client"
import {
  SpaceClientCtx,
  SpaceClientEvent,
} from "gamezilla-app/app/spaces/@shared/space"
import { GameMainMenu } from "gamezilla-app/app/spaces/game/@shared/game"
import { GameClientModule } from "../../@shared/architecture/game-client-v2"
import { SpaceClientCmd } from "../../@shared/space-client-cmd"
import { CoverArt } from "./@shared/chess-ui"
import { CHESS_SOUND } from "./@shared/chess/chess-sounds"
import {
  ModelClient,
  ModelSync,
  MsgClient,
  MsgSync,
  MsgToClient,
  MsgToServer,
} from "./chess.core"
import * as Puzzle from "./puzzle/puzzle.client"
import * as VsBot from "./vs-bot/vs-bot.client"
import * as VsUser from "./vs-user/vs-user.client"

//
//
//
//
//
//

type Client = GameClient<{
  ModelClient: ModelClient
  MsgClient: MsgClient
  MsgToClient: MsgToClient
  MsgToServer: MsgToServer
  ClientCtx: SpaceClientCtx
  MsgSync: MsgSync
  ModelSync: ModelSync
  ClientCmd: SpaceClientCmd<{ MsgToServer: MsgToServer; MsgClient: MsgClient }>
  ClientEvent: SpaceClientEvent
}>

//
//
//
// Model
//
//
//

export const init: Client["init"] = ({ model }) => {
  if (model) {
    return { model }
  }

  return {
    model: {
      mode: { t: "none" },
      requests: {},
    },
    msgCmd: [preloadSound(Object.values(CHESS_SOUND))],
  }
}

//
//
//
// Update
//
//
//

// @ts-ignore
export const update: Client["update"] = (input) => {
  return GameClientModule.andThen(
    init(input),
    (model) => GameMainMenu.update({ msg: input.msg, model }),
    (model) => {
      const { msg, ctx } = input

      switch (msg?.t) {
        case "input-mode": {
          return {
            model: {
              ...model,
              requests: {
                ...model.requests,
                [msg.t]: RemoteResult.loading,
              },
            },
            msgCmd: [sendToServer(msg)],
          }
        }

        case "vs-user": {
          if (model.mode?.t === "vs-user") {
            const updated = VsUser.update(msg.c, model.mode.c)

            return {
              model: {
                ...model,
                mode: { t: "vs-user", c: updated.model },
              },
              eff: Eff.tag("vs-user", updated.eff),
            }
          }

          return { model }
        }

        case "vs-bot": {
          if (model.mode?.t === "vs-bot") {
            const updated = VsBot.update({
              msg: msg.c,
              model: model.mode.c,
              ctx,
            })

            return {
              model: {
                ...model,
                mode: { t: "vs-bot", c: updated.model },
              },
              eff: Eff.tag("vs-bot", updated.eff),
            }
          }

          return { model }
        }

        case "puzzle": {
          if (model.mode?.t === "puzzle") {
            const updated = Puzzle.update({
              ctx,
              model: model.mode.c,
              msg: msg.c,
            })

            return {
              model: {
                ...model,
                mode: { t: "puzzle", c: updated.model },
              },
              eff: Eff.tag("puzzle", updated?.eff ?? Eff.None),
              msgCmd: ClientCmd.tag("puzzle", updated.msgCmd),
            }
          }
          return { model }
        }

        default: {
          return { model }
        }
      }
    },
    (model) => {
      const { msgServer, ctx } = input

      if (!msgServer) {
        return { model }
      }

      switch (msgServer.t) {
        case "input-mode": {
          return GameClientModule.andThen(
            { model },
            (model) => {
              const { result } = msgServer

              const modelNew: ModelClient = {
                ...model,
                requests: {
                  ...model.requests,
                  [msgServer.t]: RemoteResult.map(result, () => null),
                },
              }

              if (isErr(result)) {
                return { model: modelNew }
              }

              return { model: modelNew }
            },

            (model) => {
              if (model.mode.t === "none") {
                return {
                  model,
                  msgCmd: [playSound(APP_SOUND.navBackwardMin)],
                }
              }
              return {
                model,
                msgCmd: [playSound(APP_SOUND.navForwardMin)],
              }
            },
          )
        }

        case "vs-user": {
          if (model?.mode?.t === "vs-user") {
            const [child, eff] = VsUser.updateFromServer(
              { ctx },
              msgServer.c,
              model.mode.c,
            )

            return {
              model: {
                ...model,
                mode: { t: "vs-user", c: child },
              },
              eff: Eff.tag("vs-user", eff),
            }
          }

          return { model }
        }

        case "vs-bot": {
          if (model?.mode?.t === "vs-bot") {
            const updated = VsBot.updateFromServer({
              msg: msgServer.c,
              model: model.mode.c,
            })

            return {
              model: {
                ...model,
                mode: { t: "vs-bot", c: updated.model },
              },
              eff: Eff.tag("vs-bot", updated.eff),
            }
          }

          return { model }
        }

        case "puzzle": {
          if (model?.mode?.t !== "puzzle") {
            return { model }
          }

          const updated = Puzzle.updateFromServer({
            ctx,
            model: model.mode.c,
            msg: msgServer.c,
          })

          return {
            model: {
              ...model,
              mode: { t: "puzzle", c: updated.model },
            },
            eff: Eff.tag("puzzle", updated?.eff ?? Eff.None),
            msgCmd: ClientCmd.tag("puzzle", updated.msgCmd),
          }
        }
      }
    },
  )
}

//
//
//
// Subscriptions
//
//
//

export const subscriptions: Client["subscriptions"] = (_input) => {
  return Sub.None
}

//
//
//
// View
//
//
//

export const View: Client["View"] = (input) => {
  switch (input.modelSync.t) {
    case "none": {
      return (
        <GameMainMenu.View
          title="Chess"
          ctx={input.ctx}
          renderCoverArt={(props) => <CoverArt {...props} key={props.key} />}
          dispatch={input.dispatch}
          buttons={[
            GameMainMenu.buttons.playComputer({
              onClick: () =>
                input.dispatch({
                  t: "input-mode",
                  mode: "vs-bot",
                  userId: input.ctx.currentUserId,
                }),
            }),
            GameMainMenu.buttons.playFriend({
              onClick: () =>
                input.dispatch({
                  t: "input-mode",
                  mode: "vs-user",
                  userId: input.ctx.currentUserId,
                }),
            }),
            {
              title: "Puzzles",
              description: "Train with more than 3 million puzzles",
              renderIcon: (props) => <IconPuzzlePiece {...props} />,
              onClick: () =>
                input.dispatch({
                  t: "input-mode",
                  mode: "puzzle",
                  userId: input.ctx.currentUserId,
                }),
            },
          ]}
        />
      )
    }

    case "vs-bot": {
      return null
      // return (
      //   <VsBot.View
      //     ctx={ctx}
      //     dispatch={(c) => dispatch({ t: "vs-bot", c })}
      //     model={model?.mode.c}
      //     onClose={() => {
      //       dispatch({
      //         t: "input-mode",
      //         mode: "none",
      //         userId: ctx.currentUserId,
      //       });
      //     }}
      //   />
      // );
    }

    case "vs-user": {
      return null
      // return (
      //   <VsUser.View
      //     ctx={ctx}
      //     model={model.mode.c}
      //     dispatch={(c) => dispatch({ t: "vs-user", c })}
      //     onQuit={() => {
      //       dispatch({
      //         t: "input-mode",
      //         mode: "none",
      //         userId: ctx.currentUserId,
      //       });
      //     }}
      //   />
      // );
    }

    case "puzzle": {
      return null
      // return (
      //   <Puzzle.View
      //     ctx={ctx}
      //     model={model.mode.c}
      //     dispatch={(c) => dispatch({ t: "puzzle", c })}
      //     onClose={() => {
      //       dispatch({
      //         t: "input-mode",
      //         mode: "none",
      //         userId: ctx.currentUserId,
      //       });
      //     }}
      //   />
      // );
    }
  }
}

export const ViewFeedItem: Client["ViewFeedItem"] = () => {
  return null
}
