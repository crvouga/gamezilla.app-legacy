import { Eff } from '~/@/eff'
import { Box } from '~/@/vdom/primitives/box'
import { exhaustive } from '~/@/function/exhaustive'
import { pipe } from '~/@/function/pipe'
import { isErr } from '~/@/result'
import { Sub } from '~/@/sub'
import { Avatar } from '~/@/ui/avatar'
import { IconArrowLeft, IconRobot } from '~/@/ui/icon'
import { Spinner } from '~/@/ui/spinner'
import { UserProfile } from '~/app/@/data/user-profile'
import { h } from '~/@/vdom/h'
import { ScreenLayout } from '~/app/@/ui/screen/layout/screen-layout'
import { SpaceFrontendCtx } from '~/app/spaces/@/frontend/ctx'
import { VsBotSetup } from '~/app/spaces/game/games/@/vs-bot'
import { LayoutGame } from '../../@/ui/game-layout'
import { Chess } from '../@/chess'
import { ChessBotLevel } from '../@/chess-bot-level/chess-bot-level'
import { Chessboard, CoverArt, PlayerIcon } from '../@/chess-ui'
import {
  type ModelBackend,
  type ModelFrontend,
  type MsgFrontend,
  type MsgToFrontend,
  type SpaceModel,
  initSpace,
  isBotTurn,
  updateSpace,
} from './vs-bot.types'
import { Text } from '~/@/vdom/primitives/text'

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
        }
      }

      const spaceModel = handled.value

      const modelNew = mergeWithBackend({
        frontend: model,
        backend: spaceModel,
      })

      return {
        model: modelNew,
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
  return Sub.none()
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
    return h(VsBotSetup.View, {
      model: model.vsBotSetup,
      dispatch: (c) => dispatch({ t: 'vs-bot-setup', c }),
      title: ctx.t('chess'),
      renderCoverArt: (input) => {
        return h(CoverArt, input)
      },
      bot: {
        label: ctx.t('chess.bot-level', model.spaceModel.botLevel),
        renderIcon: (input) =>
          ChessBotLevel.render({
            level: model.spaceModel.botLevel,
            ...input,
          }),
      },
      botVariants: ChessBotLevel.all.map((botLevel) => {
        return {
          label: ctx.t('chess.bot-level', botLevel),
          renderIcon: (input: { class: string }) =>
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
      }),
      onSwapSides: () =>
        dispatch({
          t: 'start-playing',
          color: model.spaceModel.userColor === 'w' ? 'b' : 'w',
        }),
      canStartGame: model.spaceModel.userId !== null,
      ctx: ctx,
      human: {
        player: model.spaceModel.userColor === 'b' ? 'player-two' : 'player-one',
        userId: model.spaceModel.userId,
      },
      onQuit: onClose,
      onStartGame: () =>
        dispatch({
          t: 'start-game',
        }),
      playerOne: {
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
          return h(PlayerIcon, { ...input, color: 'w' })
        },
      },
      playerTwo: {
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
          return h(PlayerIcon, { ...input, color: 'b' })
        },
      },
    })
  }

  const botSlot = h(Box, { class: 'flex flex-row w-full items-center gap-3 p-3' }, [
    h(IconRobot, { class: 'h-10 w-10' }),
    h(Box, { class: 'flex-1 text-lg' }, [Text({ text: ChessBotLevel.toString(model.spaceModel.botLevel) })]),
    isBotTurn(model.spaceModel) && h(Spinner, { class: 'h-10 w-10' }),
  ])

  const userSlot = h(Box, { class: 'flex flex-row w-full items-center gap-3 p-3' }, [
    h(Avatar, {
      class: 'h-10 w-10',
      src: UserProfile.toAvatarUrl(ctx.profilesByUserId[model.spaceModel.userId]),
    }),
    h(Box, { class: 'flex-1 text-lg' }, [
      Text({ text: ctx.profilesByUserId[model.spaceModel.userId]?.username ?? '' }),
    ]),
  ])

  const boardOrientation = model.isFlipped
    ? Chess.toOppositeColor(model.spaceModel.userColor)
    : model.spaceModel.userColor

  const topSlot = boardOrientation === model.spaceModel.userColor ? botSlot : userSlot
  const bottomSlot = boardOrientation === model.spaceModel.userColor ? userSlot : botSlot
  const board = model.spaceModel.board

  return h(ScreenLayout, {
    parentScreen: ctx.parentScreen,
    ctx: ctx,
    id: 'chess-vs-bot',
    renderBody: () =>
      h(LayoutGame, { ctx }, [
        h(Box, { class: 'flex w-full flex-1 flex-col items-center justify-center' }, [
          topSlot,
          h(Chessboard, {
            id: 'chessboard',
            model: board,
            orientation: boardOrientation,
            onPieceDrop: (move) => {
              const msg: MsgFrontend = {
                t: 'input-move',
                move: {
                  from: move.source,
                  to: move.target,
                  promotion: 'q',
                },
              }
              dispatch(msg)
              return true
            },
          }),
          bottomSlot,
        ]),
      ]),
    actionBar: {
      id: 'vs-bot-buttons',
      variant: {
        t: 'uniform',
        actions: [
          {
            id: ctx.t('app.exit'),
            icon: (props) => h(IconArrowLeft, props),
            label: ctx.t('app.exit'),
            onClick: onClose,
          },
        ],
      },
    },
  })
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
