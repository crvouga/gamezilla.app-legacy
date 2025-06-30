import { Eff } from '~/@/eff'
import { RemoteResult, isErr } from '~/@/result'
import { Sub } from '~/@/sub'
import { IconPuzzlePiece } from '~/@/ui/icon'
import { APP_SOUND } from '~/app/@/frontend/app-sound'
import { PlaySoundCmd } from '~/app/@/frontend/play-sound-cmd.$msg'
import { SpaceFrontendCtx } from '~/app/spaces/@/frontend/ctx'
import type { GameFrontend } from '~/app/spaces/game/games/@/architecture/game-frontend'
import { GameFrontendModule } from '~/app/spaces/game/games/@/architecture/game-frontend-v2'
import { GameMainMenu } from '../@/ui/game-main-menu'
import { CoverArt } from './@/chess-ui'
import type { ModelFrontend, ModelSpace, MsgFrontend, MsgSpace, MsgToBackend, MsgToFrontend } from './chess.types'
import * as Puzzle from './puzzle/puzzle.frontend'
import * as VsBot from './vs-bot/vs-bot.frontend'
import * as VsUser from './vs-user/vs-user.frontend'

//
//
//
//
//
//

type Frontend = GameFrontend<{
  ModelFrontend: ModelFrontend
  MsgFrontend: MsgFrontend
  MsgToFrontend: MsgToFrontend
  MsgToBackend: MsgToBackend
  FrontendCtx: SpaceFrontendCtx
  MsgSpace: MsgSpace
  ModelSpace: ModelSpace
}>

//
//
//
// Model
//
//
//

export const init: Frontend['init'] = ({ model }) => {
  if (model) {
    return { model }
  }

  return {
    model: {
      mode: {
        t: 'none',
      },
      requests: {},
    },
    // msgOut: [PreloadSoundsCmd.init(Object.values(CHESS_SOUND))],
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
export const update: Frontend['update'] = (input) => {
  return GameFrontendModule.andThen(
    init(input),
    (model) =>
      GameMainMenu.update({
        msg: input.msg,
        model,
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
                [msg.t]: RemoteResult.Loading,
              },
            },
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
                  c: updated.model,
                },
              },
              eff: Eff.tag('vs-user', updated.eff),
            }
          }

          return {
            model,
          }
        }

        case 'vs-bot': {
          if (model.mode?.t === 'vs-bot') {
            const updated = VsBot.update({
              msg: msg.c,
              model: model.mode.c,
              ctx,
            })

            return {
              model: {
                ...model,
                mode: {
                  t: 'vs-bot',
                  c: updated.model,
                },
              },
              eff: Eff.tag('vs-bot', updated.eff),
            }
          }

          return {
            model,
          }
        }

        case 'puzzle': {
          if (model.mode?.t === 'puzzle') {
            const updated = Puzzle.update({
              ctx,
              model: model.mode.c,
              msg: msg.c,
            })

            return {
              model: {
                ...model,
                mode: {
                  t: 'puzzle',
                  c: updated.model,
                },
              },
              eff: Eff.tag('puzzle', updated?.eff ?? Eff.None),
              // msgCmd: AppFrontendCmd.tag('puzzle', updated.msgCmd),
            }
          }
          return {
            model,
          }
        }

        default: {
          return {
            model,
          }
        }
      }
    },
    (model) => {
      const { msgBackend, ctx } = input

      if (!msgBackend) {
        return {
          model,
        }
      }

      switch (msgBackend.t) {
        case 'input-mode': {
          return GameFrontendModule.andThen(
            {
              model,
            },
            (model) => {
              const { result } = msgBackend

              const modelNew: ModelFrontend = {
                ...model,
                requests: {
                  ...model.requests,
                  [msgBackend.t]: RemoteResult.map(result, () => null),
                },
              }

              if (isErr(result)) {
                return {
                  model: modelNew,
                }
              }

              return {
                model: modelNew,
              }
            },

            (model) => {
              if (model.mode.t === 'none') {
                return {
                  model,
                  msgOut: [PlaySoundCmd.init(APP_SOUND.navBackwardMin)],
                }
              }
              return {
                model,
                msgOut: [PlaySoundCmd.init(APP_SOUND.navForwardMin)],
              }
            },
          )
        }

        case 'vs-user': {
          if (model?.mode?.t === 'vs-user') {
            const [child, eff] = VsUser.updateFromBackend(
              {
                ctx,
              },
              msgBackend.c,
              model.mode.c,
            )

            return {
              model: {
                ...model,
                mode: {
                  t: 'vs-user',
                  c: child,
                },
              },
              eff: Eff.tag('vs-user', eff),
            }
          }

          return {
            model,
          }
        }

        case 'vs-bot': {
          if (model?.mode?.t === 'vs-bot') {
            const updated = VsBot.updateFromBackend({
              msg: msgBackend.c,
              model: model.mode.c,
            })

            return {
              model: {
                ...model,
                mode: {
                  t: 'vs-bot',
                  c: updated.model,
                },
              },
              eff: Eff.tag('vs-bot', updated.eff),
            }
          }

          return {
            model,
          }
        }

        case 'puzzle': {
          if (model?.mode?.t !== 'puzzle') {
            return {
              model,
            }
          }

          const updated = Puzzle.updateFromBackend({
            ctx,
            model: model.mode.c,
            msg: msgBackend.c,
          })

          return {
            model: {
              ...model,
              mode: {
                t: 'puzzle',
                c: updated.model,
              },
            },
            eff: Eff.tag('puzzle', updated?.eff ?? Eff.None),
            // msgCmd: AppFrontendCmd.tag('puzzle', updated.msgCmd),
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

export const subscriptions: Frontend['subscriptions'] = (_input) => {
  return Sub.none()
}

//
//
//
// View
//
//
//

export const View: Frontend['View'] = (input) => {
  switch (input.modelSpace.t) {
    case 'none': {
      return (
        <GameMainMenu.View
          title={input.ctx.t('chess')}
          ctx={input.ctx}
          renderCoverArt={(input) => <CoverArt {...input} />}
          onBack={() => input.dispatch({ t: 'game-main-menu.clicked-exit-game-button' })}
          dispatch={input.dispatch}
          buttons={[
            GameMainMenu.buttons.playComputer({
              ctx: input.ctx,
              onClick: () =>
                input.dispatch({
                  t: 'input-mode',
                  mode: 'vs-bot',
                  userId: input.ctx.currentUser.userId,
                }),
            }),
            GameMainMenu.buttons.playFriend({
              ctx: input.ctx,
              onClick: () =>
                input.dispatch({
                  t: 'input-mode',
                  mode: 'vs-user',
                  userId: input.ctx.currentUser.userId,
                }),
            }),
            {
              title: input.ctx.t('chess.puzzle-title'),
              description: input.ctx.t('chess.puzzle-description'),
              renderIcon: (input) => <IconPuzzlePiece {...input} />,
              onClick: () =>
                input.dispatch({
                  t: 'input-mode',
                  mode: 'puzzle',
                  userId: input.ctx.currentUser.userId,
                }),
            },
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
      //         userId: ctx.currentUser.userId,
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
      //         userId: ctx.currentUser.userId,
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
      //         userId: ctx.currentUser.userId,
      //       });
      //     }}
      //   />
      // );
    }
  }
}

export const ViewFeedItem: Frontend['ViewFeedItem'] = () => {
  return null
}
