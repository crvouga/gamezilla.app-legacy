import { Eff } from '~/@/eff'
import { Box } from '~/@/vdom/primitives/box'
import { exhaustive } from '~/@/function/exhaustive'
import { Option } from '~/@/option/option'
import { isErr } from '~/@/result'
import { Sub } from '~/@/sub'
import { Button } from '~/@/ui/button'
import { IconArrowLeft } from '~/@/ui/icon'
import { h } from '~/@/vdom/h'
import type { UserId } from '~/app/@/data/user-id'
import { AppFrontendCtx } from '~/app/@/frontend/ctx'
import { SpaceFrontendCtx } from '~/app/spaces/@/frontend/ctx'
import { Chess } from '../@/chess'
import {
  type ModelBackend,
  type ModelFrontend,
  type MsgFrontend,
  type MsgToFrontend,
  type SpaceModel,
  initSpace,
} from './vs-user.types'
import { Text } from '~/@/vdom/primitives/text'
import { theme } from '~/@/ui/theme/theme'

//
//
//
// Model
//
//
//

export type Model = ModelFrontend

export const init = ({
  userId,
}: {
  userId?: UserId | null
}): {
  model: ModelFrontend
} => {
  return {
    model: {
      spaceModel: initSpace({
        userId: userId ?? 'none',
      }),
      openedMenuId: Option.None,
      openedModal: 'none',
      isFlipped: false,
    },
  }
}

//
//
//
// Update
//
//
//

export type Msg = MsgFrontend

export const update = (msg: Msg, model: Model): { model: Model; eff?: Eff<Msg> } => {
  switch (msg[0]) {
    //
    //
    // MsgFrontend
    //
    //

    case 'OpenedMenu': {
      return {
        model: {
          ...model,
          openedMenuId: Option.Some(msg[1]),
        },
      }
    }

    case 'ClosedMenu': {
      return {
        model: {
          ...model,
          openedMenuId: Option.None,
        },
      }
    }

    case 'ClickedFlip': {
      return {
        model: {
          ...model,
          isFlipped: !model.isFlipped,
        },
      }
    }

    case 'OpenedModal': {
      return {
        model: {
          ...model,
          openedModal: msg[1],
        },
      }
    }

    case 'ClosedModal': {
      return {
        model: {
          ...model,
          openedModal: 'none',
        },
      }
    }

    //
    //
    //
    // MsgToBackend
    //
    //
    //

    default: {
      return {
        model,
      }
    }
  }
}

export const updateFromBackend = (
  { ctx }: { ctx: SpaceFrontendCtx },
  msg: MsgToFrontend,
  _model: Model,
): [Model, Eff<Msg>] => {
  const model: Model = {
    ..._model,
    openedMenuId: Option.None,
  }

  switch (msg[0]) {
    case 'InputClock_Done': {
      if (msg[1].t === 'err') {
        return [model, Eff.None]
      }
      return [
        {
          ...model,
          spaceModel: msg[1].value,
        },
        Eff.None,
      ]
    }

    case 'input-move-done': {
      if (msg[1].t === 'err') {
        return [model, Eff.None]
      }

      const spaceModelNew = msg[1].value

      if (spaceModelNew.type !== 'game') {
        return [model, Eff.None]
      }

      return [
        {
          ...model,
          spaceModel: spaceModelNew,
        },
        Eff.None,
      ]
    }

    case 'InputPlayer_Done': {
      if (msg[1].t === 'err') {
        return [model, Eff.None]
      }

      const spaceModel = msg[1].value

      return [
        {
          ...model,
          spaceModel,
        },
        Eff.None,
      ]
    }

    case 'StartGame_Done': {
      if (msg[1].t === 'err') {
        return [model, Eff.None]
      }

      const spaceModel = msg[1].value

      return [
        {
          ...model,
          spaceModel,
        },
        Eff.None,
      ]
    }

    //
    //
    // Draw
    //
    //

    case 'RequestToDraw_Done': {
      switch (msg[1].t) {
        case 'err': {
          return [model, Eff.None]
        }

        case 'ok': {
          return [
            {
              ...model,
              openedModal: 'AskedToDraw',
            },
            Eff.None,
          ]
        }

        default: {
          return [model, Eff.None]
        }
      }
    }

    case 'RespondToDraw_Done': {
      if (msg[1].t === 'err') {
        return [model, Eff.None]
      }

      const spaceModel = msg[1].value

      if (spaceModel.type === 'game-over') {
        return [
          {
            ...model,
            spaceModel,
          },
          Eff.None,
        ]
      }

      const isNotPlaying =
        spaceModel.type === 'game' && spaceModel.w !== ctx.currentUser.userId && spaceModel.b !== ctx.currentUser.userId

      if (isNotPlaying) {
        return [
          {
            ...model,
            spaceModel,
          },
          Eff.None,
        ]
      }

      return [
        {
          ...model,
          spaceModel,
        },
        Eff.None,
      ]
    }

    case 'CancelDraw_Done': {
      const result = msg[1]

      if (isErr(result)) {
        return [model, Eff.None]
      }

      const spaceModel = result.value

      const isNotPlaying =
        spaceModel.type === 'game' && spaceModel.w !== ctx.currentUser.userId && spaceModel.b !== ctx.currentUser.userId

      if (isNotPlaying) {
        return [
          {
            ...model,
            spaceModel,
          },
          Eff.None,
        ]
      }

      return [
        {
          ...model,
          spaceModel,
        },
        Eff.None,
      ]
    }

    //
    //
    //
    //
    //

    case 'resign_Done': {
      if (msg[1].t === 'err') {
        return [model, Eff.None]
      }

      const spaceModelNew = msg[1].value

      if (spaceModelNew.type === 'setup') {
        return [model, Eff.None]
      }

      return [
        {
          ...model,
          spaceModel: spaceModelNew,
        },
        Eff.None,
      ]
    }

    case 'NewGame_Done': {
      if (msg[1].t === 'err') {
        return [model, Eff.None]
      }

      const spaceModelNew = msg[1].value

      return [
        {
          ...model,
          spaceModel: spaceModelNew,
        },
        Eff.None,
      ]
    }

    case 'game-over': {
      return [
        {
          ...model,
          openedModal: 'game-over',
        },
        Eff.None,
      ]
    }

    case 'GameStarted': {
      return [model, Eff.None]
    }

    case 'ClockTicked': {
      const spaceModel = msg[1]

      return [
        {
          ...model,
          spaceModel,
        },
        Eff.None,
      ]
    }

    case 'player-left': {
      return [
        {
          ...model,
          spaceModel: msg[1],
        },
        Eff.None,
      ]
    }

    default: {
      return exhaustive(msg[0])
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

export const subscriptions = (_model: Model): Sub<Msg> => {
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
  onQuit,
}: {
  ctx: AppFrontendCtx
  model: Model
  dispatch: (msg: Msg) => void
  onQuit: () => void
}) => {
  if (model.spaceModel.type === 'setup') {
    return h(Box, {}, [
      h(Box, { style: theme({ flex: 1 }) }),
      h(Box, { style: theme({ flexDirection: 'row', alignItems: 'center', gap: 4, padding: 4 }) }, [
        h(Button, {
          width: 'full',
          style: theme({ flex: 1 }),
          onPress: onQuit,
          renderIconStart: (iconInput) => h(IconArrowLeft, iconInput),
          text: ctx.t('app.exit'),
        }),
        h(Button, {
          width: 'full',
          variant: 'contained',
          color: 'primary',
          style: theme({ flex: 1 }),
          text: ctx.t('game.start-game'),
        }),
      ]),
    ])
  }

  // const { w, b } = model.spaceModel;

  // const currentUserColor: Chess.Color | "none" | "Both" =
  //   ctx.currentUser.userId === w && ctx.currentUser.userId === b
  //     ? "Both"
  //     : ctx.currentUser.userId === w
  //     ? "w"
  //     : ctx.currentUser.userId === b
  //     ? "b"
  //     : "none";

  // const boardOrientation: Chess.Color = p(
  //   currentUserColor === "none" || currentUserColor === "Both"
  //     ? "w"
  //     : currentUserColor,
  //   (color) => (model.isFlipped ? Chess.toOppositeColor(color) : color)
  // );

  return h(Box, {}, [
    /* h(Chessboard, {
      model: board,
      boardOrientation: boardOrientation,
      isDraggablePiece: ({ piece }) => {
        return (
          Chess.toColor(piece) === currentUserColor ||
          currentUserColor === "Both"
        );
      },
      onPieceDrop: (moveInput) => {
        const msg: InputMove = [
          "input-move",
          {
            userId: ctx.currentUser.userId,
            ...moveInput,
          },
        ];

        dispatch(msg);

        const inputted = inputMove(msg[1], model.spaceModel);

        return inputted.t === "ok";
      },
    }), */

    h(Box, { style: theme({ flex: 1 }) }),

    h(ViewGameOverDialog, { model, dispatch }),
  ])
}

const ViewGameOverDialog = ({ model }: { model: Model; dispatch: (msg: Msg) => void }) => {
  if (model.spaceModel.type === 'setup') {
    return h(Box, {}, [h(Text, { text: toGameText(model.spaceModel) })])
  }

  if (model.spaceModel.type === 'game') {
    return h(Box, {})
  }

  return h(Box, {})
}

const toGameText = (model: SpaceModel): string => {
  switch (model.type) {
    case 'game-over': {
      switch (model.gameOver.type) {
        case 'Checkmate': {
          const colorStr = Chess.colorToString(model.gameOver.winner)
          return `${colorStr} won by checkmate`
        }

        case 'DrawByAgreement': {
          return 'Drawn by agreement'
        }

        case 'resignation': {
          return `${Chess.colorToString(model.gameOver.resigner)} resigned`
        }

        case 'Stalemate': {
          return 'Stalemate'
        }

        case 'WinOnTime': {
          return `${Chess.colorToString(model.gameOver.winner)} won on time`
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

//
//
//
//
//
//
//

export const mergeWithBackend = ({
  frontend,
  backend,
}: {
  frontend?: ModelFrontend
  backend: ModelBackend
}): ModelFrontend => {
  const initial = init({ userId: null })
  const frontendModel = frontend ?? initial.model
  return {
    isFlipped: frontendModel.isFlipped,
    openedMenuId: frontendModel.openedMenuId,
    openedModal: frontendModel.openedModal,
    spaceModel: backend,
  }
}
