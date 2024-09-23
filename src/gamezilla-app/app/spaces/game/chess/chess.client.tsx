import { Eff, RemoteResult, Sub, isErr } from 'gamezilla-app/@/core'
import { APP_SOUND, ClientCmd, playSound, preloadSound, sendToServer } from 'gamezilla-app/app/@/client'
import { IconPuzzlePiece } from 'gamezilla-app/app/@/ui'
import type { SpaceClientCtx } from 'gamezilla-app/app/spaces/@/space'
import type { SpaceClientCmd } from 'gamezilla-app/app/spaces/@/space-client-cmd'
import type { GameClient } from 'gamezilla-app/app/spaces/game/@/architecture/game-client'
import { GameClientModule } from 'gamezilla-app/app/spaces/game/@/architecture/game-client-v2'
import { GameMainMenu } from 'gamezilla-app/app/spaces/game/@/game'
import { SpaceClientEvt } from '../../@/space-client-evt'
import { CoverArt } from './@/chess-ui'
import { CHESS_SOUND } from './@/chess/chess-sounds'
import type { ModelClient, ModelCore, MsgClient, MsgCore, MsgToClient, MsgToServer } from './chess.types'
import * as Puzzle from './puzzle/puzzle.client'
import * as VsBot from './vs-bot/vs-bot.client'
import * as VsUser from './vs-user/vs-user.client'

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
  MsgCore: MsgCore
  ModelCore: ModelCore
  ClientCmd: SpaceClientCmd<{
    MsgToServer: MsgToServer
    MsgClient: MsgClient
  }>
  ClientEvent: SpaceClientEvt
}>

//
//
//
// Model
//
//
//

export const init: Client['init'] = ({ model }) => {
  if (model) {
    return { model }
  }

  return {
    model: {
      mode: {
        t: 'none'
      },
      requests: {}
    },
    msgCmd: [preloadSound(Object.values(CHESS_SOUND))]
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
export const update: Client['update'] = (input) => {
  return GameClientModule.andThen(
    init(input),
    (model) =>
      GameMainMenu.update({
        msg: input.msg,
        model
      }),
    (model) => {
      const { msg, ctx } = input

      switch (msg?.t) {
        case 'input-mode': {
          return {
            model: {
              ...model,
              requests: {
                ...model.requests,
                [msg.t]: RemoteResult.Loading
              }
            },
            msgCmd: [sendToServer(msg)]
          }
        }

        case 'vs-user': {
          if (model.mode?.t === 'vs-user') {
            const updated = VsUser.update(msg.c, model.mode.c)

            return {
              model: {
                ...model,
                mode: {
                  t: 'vs-user',
                  c: updated.model
                }
              },
              eff: Eff.tag('vs-user', updated.eff)
            }
          }

          return {
            model
          }
        }

        case 'vs-bot': {
          if (model.mode?.t === 'vs-bot') {
            const updated = VsBot.update({
              msg: msg.c,
              model: model.mode.c,
              ctx
            })

            return {
              model: {
                ...model,
                mode: {
                  t: 'vs-bot',
                  c: updated.model
                }
              },
              eff: Eff.tag('vs-bot', updated.eff)
            }
          }

          return {
            model
          }
        }

        case 'puzzle': {
          if (model.mode?.t === 'puzzle') {
            const updated = Puzzle.update({
              ctx,
              model: model.mode.c,
              msg: msg.c
            })

            return {
              model: {
                ...model,
                mode: {
                  t: 'puzzle',
                  c: updated.model
                }
              },
              eff: Eff.tag('puzzle', updated?.eff ?? Eff.None),
              msgCmd: ClientCmd.tag('puzzle', updated.msgCmd)
            }
          }
          return {
            model
          }
        }

        default: {
          return {
            model
          }
        }
      }
    },
    (model) => {
      const { msgServer, ctx } = input

      if (!msgServer) {
        return {
          model
        }
      }

      switch (msgServer.t) {
        case 'input-mode': {
          return GameClientModule.andThen(
            {
              model
            },
            (model) => {
              const { result } = msgServer

              const modelNew: ModelClient = {
                ...model,
                requests: {
                  ...model.requests,
                  [msgServer.t]: RemoteResult.map(result, () => null)
                }
              }

              if (isErr(result)) {
                return {
                  model: modelNew
                }
              }

              return {
                model: modelNew
              }
            },

            (model) => {
              if (model.mode.t === 'none') {
                return {
                  model,
                  msgCmd: [playSound(APP_SOUND.navBackwardMin)]
                }
              }
              return {
                model,
                msgCmd: [playSound(APP_SOUND.navForwardMin)]
              }
            }
          )
        }

        case 'vs-user': {
          if (model?.mode?.t === 'vs-user') {
            const [child, eff] = VsUser.updateFromServer(
              {
                ctx
              },
              msgServer.c,
              model.mode.c
            )

            return {
              model: {
                ...model,
                mode: {
                  t: 'vs-user',
                  c: child
                }
              },
              eff: Eff.tag('vs-user', eff)
            }
          }

          return {
            model
          }
        }

        case 'vs-bot': {
          if (model?.mode?.t === 'vs-bot') {
            const updated = VsBot.updateFromServer({
              msg: msgServer.c,
              model: model.mode.c
            })

            return {
              model: {
                ...model,
                mode: {
                  t: 'vs-bot',
                  c: updated.model
                }
              },
              eff: Eff.tag('vs-bot', updated.eff)
            }
          }

          return {
            model
          }
        }

        case 'puzzle': {
          if (model?.mode?.t !== 'puzzle') {
            return {
              model
            }
          }

          const updated = Puzzle.updateFromServer({
            ctx,
            model: model.mode.c,
            msg: msgServer.c
          })

          return {
            model: {
              ...model,
              mode: {
                t: 'puzzle',
                c: updated.model
              }
            },
            eff: Eff.tag('puzzle', updated?.eff ?? Eff.None),
            msgCmd: ClientCmd.tag('puzzle', updated.msgCmd)
          }
        }
      }
    }
  )
}

//
//
//
// Subscriptions
//
//
//

export const subscriptions: Client['subscriptions'] = (_input) => {
  return Sub.None
}

//
//
//
// View
//
//
//

export const View: Client['View'] = (input) => {
  switch (input.modelCore.t) {
    case 'none': {
      return (
        <GameMainMenu.View
          title={input.ctx.t('chess')}
          ctx={input.ctx}
          renderCoverArt={(input) => <CoverArt {...input} key={input.key} />}
          dispatch={input.dispatch}
          buttons={[
            GameMainMenu.buttons.playComputer({
              ctx: input.ctx,
              onClick: () =>
                input.dispatch({
                  t: 'input-mode',
                  mode: 'vs-bot',
                  userId: input.ctx.currentUserId
                })
            }),
            GameMainMenu.buttons.playFriend({
              ctx: input.ctx,
              onClick: () =>
                input.dispatch({
                  t: 'input-mode',
                  mode: 'vs-user',
                  userId: input.ctx.currentUserId
                })
            }),
            {
              title: input.ctx.t('chess.puzzle-title'),
              description: input.ctx.t('chess.puzzle-description'),
              renderIcon: (input) => <IconPuzzlePiece {...input} />,
              onClick: () =>
                input.dispatch({
                  t: 'input-mode',
                  mode: 'puzzle',
                  userId: input.ctx.currentUserId
                })
            }
          ]}
        />
      )
    }

    case 'vs-bot': {
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

    case 'vs-user': {
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

    case 'puzzle': {
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

export const ViewFeedItem: Client['ViewFeedItem'] = () => {
  return null
}
