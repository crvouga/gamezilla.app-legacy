import { Eff } from '~/@/eff'
import { exhaustive } from '~/@/function/exhaustive'
import { pipe } from '~/@/function/pipe'
import { isErr } from '~/@/result'
import { Sub } from '~/@/sub'
import { AppFrontendCmd, sendToBackend } from '~/app/@/frontend/cmd'
import { Avatar, IconArrowLeftOnRect, IconRobot, Spinner } from '~/app/@/ui'
import { ScreenActions } from '~/app/@/ui/screen-actions'
import { SpaceFrontendCtx } from '~/app/spaces/@/frontend/ctx'
import { VsBotSetup } from '~/app/spaces/game/games/@/vs-bot'
import { LayoutGame } from '../../@/ui/layout-game'
import { Chess } from '../@/chess'
import { ChessBotLevel } from '../@/chess-bot-level/chess-bot-level'
import { Chessboard, CoverArt, PlayerIcon } from '../@/chess-ui'
import {
  type SpaceModel,
  type ModelFrontend,
  type ModelBackend,
  type MsgFrontend,
  type MsgToFrontend,
  type MsgToBackend,
  initSpace,
  isBotTurn,
  updateSpace,
} from './vs-bot.types'

//
//
//
// Model
//
//
//

export const init: ModelFrontend = {
  vsBotSetup: VsBotSetup.init,
  spaceModel: initSpace,
  openedMenuId: null,
  openedModal: null,
  isFlipped: false,
}

//
//
//
// Update
//
//
//

export const update = ({
  msg,
  model: modelPrev,
  ctx,
}: {
  ctx: SpaceFrontendCtx
  msg: MsgFrontend
  model: ModelFrontend
}): {
  model: ModelFrontend
  eff?: Eff<MsgFrontend>
  msgCmd?: AppFrontendCmd<{
    MsgToBackend: MsgToBackend
    MsgFrontend: MsgFrontend
  }>[]
} => {
  const model: ModelFrontend = {
    ...modelPrev,
    openedMenuId: null,
  }

  switch (msg.t) {
    case 'closed-modal': {
      return {
        model: {
          ...model,
          openedModal: null,
        },
      }
    }

    case 'clicked-flip': {
      return {
        model: {
          ...model,
          isFlipped: !model.isFlipped,
        },
      }
    }

    case 'opened-menu': {
      return {
        model: {
          ...model,
          openedMenuId: msg.menuId,
        },
      }
    }

    case 'closed-menu': {
      return {
        model: {
          ...model,
          openedMenuId: null,
        },
      }
    }

    case 'vs-bot-setup': {
      const updated = VsBotSetup.update(model.vsBotSetup, msg.c)
      return {
        model: {
          ...model,
          vsBotSetup: updated,
        },
      }
    }

    default: {
      const handled = updateSpace({
        ctx,
        msg,
        model: model.spaceModel,
      })

      if (handled.t === 'err') {
        return {
          model,
          msgCmd: [sendToBackend(msg)],
        }
      }

      const spaceModel = handled.value

      const modelNew = mergeWithBackend({
        frontend: model,
        backend: spaceModel,
      })

      return {
        model: modelNew,
        msgCmd: [sendToBackend(msg)],
      }
    }
  }
}

export const updateFromBackend = (input: {
  msg: MsgToFrontend
  model: ModelFrontend
}): {
  model: ModelFrontend
  eff?: Eff<MsgFrontend>
} => {
  return pipe(
    updateFromBackendMain(input),
    // andThen((model) => {
    //   if (input.model.spaceModel.type !== 'game-over' && model.spaceModel.type === 'game-over') {
    //     return {
    //       model: {
    //         ...model,
    //         openedModal: 'game-over'
    //       }
    //     }
    //   }

    //   if (input.model.spaceModel.type !== 'game' && model.spaceModel.type === 'game') {
    //     return {
    //       model
    //     }
    //   }

    //   return {
    //     model
    //   }
    // })
  )
}

const updateFromBackendMain: typeof updateFromBackend = ({ msg, model }) => {
  switch (msg.t) {
    case 'bot-moved': {
      const { result } = msg

      if (isErr(result)) {
        return {
          model,
        }
      }

      const { didCapture, ...spaceModel } = result.value

      return {
        model: {
          ...model,
          spaceModel,
        },
      }
    }

    case 'player-left': {
      const merged = mergeWithBackend({
        frontend: model,
        backend: msg.model,
      })
      return {
        model: merged,
      }
    }

    case 'input-move': {
      const { result } = msg

      if (isErr(result)) {
        return {
          model,
        }
      }

      const spaceModelNew = result.value

      const modelNew = mergeWithBackend({
        frontend: model,
        backend: spaceModelNew,
      })

      return {
        model: modelNew,
      }
    }

    default: {
      const { result } = msg

      if (isErr(result)) {
        return {
          model,
        }
      }

      const modelNew = mergeWithBackend({
        frontend: model,
        backend: result.value,
      })

      return {
        model: modelNew,
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

export const mergeWithBackend = ({
  frontend = init,
  backend,
}: {
  frontend?: ModelFrontend
  backend: ModelBackend
}): ModelFrontend => {
  return {
    isFlipped: frontend.isFlipped,
    openedMenuId: frontend.openedMenuId,
    openedModal: frontend.openedModal,
    spaceModel: backend,
    vsBotSetup: frontend.vsBotSetup,
  }
}

//
//
//
// Subscriptions
//
//
//

export const subscriptions = (_model: ModelFrontend): Sub<MsgFrontend> => {
  return Sub.None
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
  onClose,
}: {
  ctx: SpaceFrontendCtx
  model: ModelFrontend
  dispatch: (msg: MsgFrontend) => void
  onClose: () => void
}) => {
  if (model.spaceModel.type === 'setup') {
    return (
      <VsBotSetup.View
        model={model.vsBotSetup}
        dispatch={(c) => dispatch({ t: 'vs-bot-setup', c })}
        title={ctx.t('chess')}
        renderCoverArt={(input) => {
          return <CoverArt {...input} />
        }}
        bot={{
          label: ctx.t('chess.bot-level', model.spaceModel.botLevel),
          renderIcon: (input) =>
            ChessBotLevel.render({
              level: model.spaceModel.botLevel,
              ...input,
            }),
        }}
        botVariants={ChessBotLevel.all.map((botLevel) => {
          return {
            label: ctx.t('chess.bot-level', botLevel),
            renderIcon: (input) =>
              ChessBotLevel.render({
                level: botLevel,
                ...input,
              }),
            onSelect: () =>
              dispatch({
                t: 'input-bot-level',
                botLevel,
              }),
          }
        })}
        onSwapSides={() =>
          dispatch({
            t: 'start-playing',
            color: model.spaceModel.userColor === 'w' ? 'b' : 'w',
          })
        }
        canStartGame={model.spaceModel.userId !== null}
        ctx={ctx}
        human={{
          player: model.spaceModel.userColor === 'b' ? 'player-two' : 'player-one',
          userId: model.spaceModel.userId,
        }}
        onQuit={onClose}
        onStartGame={() =>
          dispatch({
            t: 'start-game',
          })
        }
        playerOne={{
          label: ctx.t('chess.white'),
          onStartPlaying: () =>
            dispatch({
              t: 'start-playing',
              color: 'w',
            }),
          onStopPlaying: () =>
            dispatch({
              t: 'stop-playing',
            }),
          renderIcon: (input) => {
            return <PlayerIcon {...input} color='w' />
          },
        }}
        playerTwo={{
          label: ctx.t('chess.black'),
          onStartPlaying: () =>
            dispatch({
              t: 'start-playing',
              color: 'b',
            }),
          onStopPlaying: () =>
            dispatch({
              t: 'stop-playing',
            }),
          renderIcon: (input) => {
            return <PlayerIcon {...input} color='b' />
          },
        }}
      />
    )
  }

  const botSlot = (
    <div className='flex w-full items-center gap-3 p-3'>
      <IconRobot className='h-10 w-10' />

      <p className='flex-1 text-lg'>{ChessBotLevel.toString(model.spaceModel.botLevel)}</p>

      {isBotTurn(model.spaceModel) && <Spinner className='h-10 w-10' />}
    </div>
  )

  const userSlot = (
    <div className='flex w-full items-center gap-3 p-3'>
      <Avatar className='h-10 w-10' src={ctx.profiles[model.spaceModel.userId]?.avatarUrl} />

      <p className='flex-1 text-lg'>{ctx.profiles[model.spaceModel.userId]?.username}</p>
    </div>
  )

  const boardOrientation = model.isFlipped
    ? Chess.toOppositeColor(model.spaceModel.userColor)
    : model.spaceModel.userColor

  const topSlot = boardOrientation === model.spaceModel.userColor ? botSlot : userSlot

  const bottomSlot = boardOrientation === model.spaceModel.userColor ? userSlot : botSlot

  return (
    <LayoutGame ctx={ctx}>
      <div className='flex w-full flex-1 flex-col items-center justify-center'>
        {topSlot}

        <Chessboard
          id='chessboard'
          model={model.spaceModel.board}
          orientation={boardOrientation}
          onPieceDrop={(move) => {
            const msg: MsgFrontend = {
              t: 'input-move',
              move: {
                from: move.source,
                to: move.target,
                promotion: 'q',
              },
            }

            dispatch(msg)

            // return result.t === "ok";
            return true
          }}
        />
        {bottomSlot}
      </div>
      <ScreenActions.View
        id='vs-bot-buttons'
        ctx={ctx}
        open={false}
        onToggle={() => {}}
        buttons={[
          {
            icon: (props) => <IconArrowLeftOnRect {...props} />,
            label: ctx.t('app.exit'),
            onClick: onClose,
          },
        ]}
      />
    </LayoutGame>
  )
}

export const toGameText = (model: SpaceModel): string => {
  switch (model.type) {
    case 'game-over': {
      switch (model.gameOver.type) {
        case 'Checkmate': {
          const color = Chess.colorToString(model.gameOver.winner)
          return `${color} won by checkmate`
        }

        case 'Stalemate': {
          return 'Stalemate'
        }

        default:
          return exhaustive(model.gameOver)
      }
    }

    case 'setup': {
      return 'Setting up game'
    }

    case 'game': {
      if (Chess.inCheck(model.board)) {
        return `${Chess.colorToString(Chess.toTurn(model.board))} is in check`
      }

      return `${Chess.colorToString(Chess.toTurn(model.board))}'s turn`
    }

    default:
      return exhaustive(model)
  }
}
