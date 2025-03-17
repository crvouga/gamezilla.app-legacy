import { Eff } from '~/@/eff'
import { Translator } from '~/@/l18n/generated'
import { isErr } from '~/@/result'
import {
  Avatar,
  IconArrowRightCircle,
  IconArrowLeftOnRect,
  IconArrowRight,
  IconArrowRotateLeft,
  IconCheckmarkCircle,
  IconLightbulb,
  IconXMark,
  Spinner,
  cn,
} from '~/@/ui'
import { APP_SOUND, AppFrontendCmd, playSound, sendToBackend } from '~/app/@/frontend/cmd'
import { ScreenAction } from '~/app/@/ui/screen/action-bar/screen-action-bar-props'
import { SpaceFrontendCtx } from '~/app/spaces/@/frontend/ctx'
import { GameFrontendModule } from '~/app/spaces/game/games/@/architecture/game-frontend-v2'
import { LayoutGame } from '../../@/ui/game-layout'
import { Chess } from '../@/chess'
import { Chessboard } from '../@/chess-ui/chessboard'
import { CHESS_SOUND } from '../@/chess/chess-sounds'
import {
  type ModelFrontend,
  type MsgFrontend,
  type MsgToBackend,
  type MsgToFrontend,
  type SpaceModel,
  initSpace,
  isIncorrect,
  isNoMoreHints,
  isSolved,
  toCurrentBoard,
  toNextEloRating,
  toPlayerColor,
  updateSpace,
} from './puzzle.types'

//
//
// Model
//
//

export const init = (): {
  model: ModelFrontend
} => {
  return {
    model: initSpace,
  }
}

//
//
// Update
//
//

export const update = (input: {
  msg: MsgFrontend
  model: ModelFrontend
  ctx: SpaceFrontendCtx
}): {
  model: ModelFrontend
  eff?: Eff<MsgFrontend>
  msgCmd?: AppFrontendCmd<{
    MsgToBackend: MsgToBackend
    MsgFrontend: MsgFrontend
  }>[]
} => {
  return GameFrontendModule.andThen(
    input,
    (model) =>
      updateMain({
        ...input,
        model,
      }),
    (model) => {
      if (input.msg.t === 'input-move') {
        if (input.msg.didCapture) {
          return {
            model,
            msgCmd: [playSound(CHESS_SOUND.captureSound)],
          }
        }
        return {
          model,
          msgCmd: [playSound(CHESS_SOUND.moveSound)],
        }
      }
      return {
        model,
      }
    },
    (model) => {
      if (!isIncorrect(input.model) && isIncorrect(model)) {
        return {
          model,
          msgCmd: [playSound(APP_SOUND.alertErrorMd)],
        }
      }
      if (!isSolved(input.model) && isSolved(model)) {
        return {
          model,
          msgCmd: [playSound(APP_SOUND.celebration)],
        }
      }
      return {
        model,
      }
    },
  )
}

export const updateMain = ({
  msg,
  model,
  ctx,
}: {
  msg: MsgFrontend
  model: ModelFrontend
  ctx: SpaceFrontendCtx
}): {
  model: ModelFrontend
  eff?: Eff<MsgFrontend>
  msgCmd?: AppFrontendCmd<{
    MsgToBackend: MsgToBackend
    MsgFrontend: MsgFrontend
  }>[]
} => {
  const updated = updateSpace({ msg, model, ctx })

  const modelNew = mergeWithBackend({
    frontend: model,
    backend: updated.t === 'err' ? model : updated.value,
  })

  return {
    model: modelNew,
    msgCmd: [sendToBackend(msg)],
    eff: Eff.None,
  }
}

export const updateFromBackend = (input: {
  ctx: SpaceFrontendCtx
  msg: MsgToFrontend
  model: ModelFrontend
}): {
  model: ModelFrontend
  eff?: Eff<MsgFrontend>
  msgCmd?: AppFrontendCmd<{
    MsgToBackend: MsgToBackend
    MsgFrontend: MsgFrontend
  }>[]
} => {
  return updateFromBackendMain(input)
}

export const updateFromBackendMain: typeof updateFromBackend = ({
  msg,
  model,
}: {
  ctx: SpaceFrontendCtx
  msg: MsgToFrontend
  model: ModelFrontend
}): {
  model: ModelFrontend
  msgCmd?: AppFrontendCmd<{
    MsgToBackend: MsgToBackend
    MsgFrontend: MsgFrontend
  }>[]
} => {
  switch (msg.t) {
    case 'clock-tick': {
      return {
        model: {
          ...model,
          backendNow: msg.now,
        },
      }
    }

    default: {
      const result = msg.result

      if (isErr(result)) {
        return {
          model,
        }
      }

      const merged = mergeWithBackend({
        frontend: model,
        backend: result.value,
      })

      return {
        model: merged,
      }
    }
  }
}

export const mergeWithBackend = ({
  frontend,
  backend,
}: {
  frontend?: ModelFrontend
  backend: SpaceModel
}): ModelFrontend => {
  return {
    ...frontend,
    ...backend,
  }
}

//
//
// View
//
//

const toDurationMs = (ctx: SpaceFrontendCtx, model: ModelFrontend) => {
  if (model.t === 'loading') {
    return null
  }
  if (model.t === 'started') {
    return Math.max(0, (model.backendNow ?? ctx.now) - model.startedAt)
  }
  return model.endedAt - model.startedAt
}

export const View = ({
  model,
  ctx,
  dispatch,
}: {
  ctx: SpaceFrontendCtx
  model: ModelFrontend
  dispatch: (m: MsgFrontend) => void
  onClose: () => void
}) => {
  const durationMs = toDurationMs(ctx, model)
  const isSpectating = ctx.currentUser.userId !== ctx.space.hostId
  const nextEloRating = toNextEloRating(model)
  return (
    <LayoutGame ctx={ctx} isSpectating={isSpectating}>
      <ViewStatusBar model={model} />

      {/* top heads up */}
      <div className='flex w-full flex-1 flex-col items-center justify-center'>
        <div className='flex w-full items-center gap-2 px-3 py-2'>
          <Avatar src={ctx.profiles[ctx.space.hostId]?.avatarUrl} className='h-10 w-10' alt='' />

          <div className='flex flex-1 flex-col justify-center'>
            <p className='-mb-1/2 text-secondary text-xs'>Rating</p>
            <div className='flex items-center gap-1'>
              <p className='text-xl font-semibold'>{model.profile?.eloRating ?? '...'}</p>

              {model.t === 'solved' && !model.hasLost && nextEloRating && (
                <div className='rounded-xl text-lg font-semibold text-green-500'>
                  +{nextEloRating - model.profile.eloRating}
                </div>
              )}
              {model.t !== 'loading' && model.hasLost && nextEloRating && (
                <div className='rounded-xl text-lg font-semibold text-red-500'>
                  {nextEloRating - model.profile.eloRating}
                </div>
              )}
            </div>
          </div>

          <div className='flex items-center justify-end gap-2'>
            <TickingClock sec={durationMs ? Math.floor(durationMs / 1_000) : 0} />
            <p className='text-secondary font-mono text-lg font-bold'>
              {durationMs ? formatDuration(durationMs) : '-:--'}
            </p>
          </div>
        </div>

        <div className='bg-paper relative flex aspect-square w-full items-center justify-end overflow-hidden'>
          <Chessboard
            id='puzzle-chess-board'
            orientation={model.t === 'loading' ? undefined : toPlayerColor(model.puzzle)}
            model={model.t === 'loading' ? undefined : toCurrentBoard(model)}
            isPieceDraggable={(input) => {
              if (model.t !== 'started') {
                return false
              }
              const color = Chess.toColor(input.piece)

              return color === toPlayerColor(model.puzzle) && ctx.space.hostId === ctx.currentUser.userId
            }}
            onPieceDrop={(input) => {
              const chessModel = toCurrentBoard(model)

              const moved = Chess.move(
                {
                  from: input.source,
                  to: input.target,
                  promotion: 'q',
                },
                chessModel,
              )

              if (moved.t === 'ok') {
                dispatch({
                  t: 'input-move',
                  didCapture: moved.value.didCapture,
                  moveInput: {
                    from: input.source,
                    to: input.target,
                    promotion: 'q',
                  },
                })
              }
              return moved.t === 'ok'
            }}
          />
          {model.t === 'loading' && (
            <div className='absolute left-0 top-0 z-20 grid h-full w-full place-items-center bg-black/50'>
              <Spinner />
            </div>
          )}
        </div>
        <div className='grid w-full grid-cols-2 px-2 py-1'>
          <div className='flex items-center justify-start gap-1 text-xs'>
            <p className='text-secondary'>Puzzle Rating</p>
            <p>{model.t === 'loading' ? '...' : model.puzzle.rating}</p>
          </div>

          <div className='flex flex-1 items-center justify-end gap-1 text-right text-xs'>
            <p className='text-secondary'>Moved</p>
            <p className='text-inherit'>{model.t === 'loading' ? '0' : (model.moves?.length ?? '0')}</p>
            <p className='text-secondary'>out of</p>
            <p className='text-inherit'>{model.t === 'loading' ? '0' : (model.puzzle?.moves?.length ?? '0')}</p>
          </div>
        </div>
      </div>
    </LayoutGame>
  )
}

// export const toChessboardinputForHint = (model: Model): Partial<Boardinput> => {
//   const correctMove = toCorrectMove(model);

//   if (!correctMove) {
//     return {};
//   }

//   if (model.t !== "started") {
//     return {};
//   }

//   if (model.hint === "from") {
//     return {
//       customSquareStyles: {
//         [Chess.toLowercaseSquare(correctMove.from)]: {
//           backgroundColor: "#91CEBD",
//         },
//       },
//     };
//   }

//   if (model.hint === "from-and-to") {
//     return {
//       arrows: [correctMove],
//     };
//   }

//   return {};
// };

const formatDuration = (duration: number): string => {
  const minutes = Math.floor(duration / 60_000)
  const seconds = Math.floor((duration % 60_000) / 1_000)
  return `${minutes.toString().padStart(1, '0')}:${seconds.toString().padStart(2, '0')}`
}

export const BottomBarActions = ({
  model,
  onClose,
  dispatch,
  ctx,
}: {
  model: ModelFrontend
  onClose: () => void
  dispatch: (m: MsgFrontend) => void
  ctx: {
    t: Translator
  }
}): ScreenAction[] => {
  const exit: ScreenAction = {
    id: ctx.t('app.exit'),
    icon: (input) => <IconArrowLeftOnRect {...input} />,
    label: ctx.t('app.exit'),
    onClick: onClose,
  }

  const hint: ScreenAction = {
    id: ctx.t('game.hint'),
    icon: (input) => <IconLightbulb {...input} />,
    label: ctx.t('game.hint'),
    disabled: isNoMoreHints(model) || model.t === 'loading',
    onClick: () =>
      dispatch({
        t: 'show-hint',
      }),
  }

  const retry: ScreenAction = {
    id: ctx.t('app.retry'),
    icon: (input) => <IconArrowRotateLeft {...input} />,
    label: ctx.t('app.retry'),
    onClick: () =>
      dispatch({
        t: 'retry',
      }),
    color: 'danger',
  }

  const skip: ScreenAction = {
    id: ctx.t('app.skip'),
    icon: (input) => <IconArrowRight {...input} />,
    label: ctx.t('app.skip'),
    onClick: () =>
      dispatch({
        t: 'skip',
      }),
  }

  const next: ScreenAction = {
    id: ctx.t('app.next'),
    icon: (input) => <IconArrowRightCircle {...input} />,
    label: ctx.t('app.next'),
    color: 'success',
    onClick: () => dispatch({ t: 'next' }),
  }

  if (model.t === 'loading') {
    return [exit, hint]
  }

  if (model.t === 'started') {
    return [exit, hint]
  }

  if (model.t === 'incorrect') {
    return [exit, retry, skip]
  }

  if (model.t === 'solved') {
    return [exit, next]
  }

  if (model.t === 'solved-with-hint') {
    return [exit, next]
  }

  return []
}

const ViewStatusBar = (input: { model: ModelFrontend }) => {
  if (input.model.t === 'loading') {
    return (
      <div className='flex w-full items-center justify-center p-2'>
        <p className='text-xl'>...</p>
      </div>
    )
  }

  if (input.model.t === 'incorrect') {
    return (
      <div className='flex w-full items-center justify-center gap-2 bg-red-500 p-2 text-white'>
        <IconXMark className='size-6' />
        <p className='text-xl'>Incorrect</p>
      </div>
    )
  }

  if (input.model.t === 'solved') {
    return (
      <div className='flex w-full items-center justify-center gap-2 bg-green-500 p-2 text-white'>
        <IconCheckmarkCircle className='size-6' />
        <p className='text-xl'>Correct</p>
      </div>
    )
  }

  if (input.model.t === 'started') {
    return (
      <div
        className={cn(
          'flex w-full items-center justify-center gap-2 p-2',
          toPlayerColor(input.model.puzzle) === 'b' ? 'bg-black text-white' : 'bg-white text-black',
        )}
      >
        <div
          className={cn(
            'size-6 rounded-full border-2',
            toPlayerColor(input.model.puzzle) === 'b' ? 'border-[#ababab] bg-black' : 'border-black bg-white',
          )}
        />
        <p className='text-xl text-inherit'>{Chess.colorToString(toPlayerColor(input.model.puzzle))} to move</p>
      </div>
    )
  }

  if (input.model.t === 'solved-with-hint') {
    return (
      <div className='bg-paper flex w-full items-center justify-center gap-2 p-2 text-white'>
        <IconCheckmarkCircle className='size-6' />
        <p className='text-xl'>Solved with hint</p>
      </div>
    )
  }

  return <div />
}

const TickingClock = (input: { sec: number }) => {
  return (
    <svg className='h-5 w-5' viewBox='-1 -1 2 2' stroke='currentColor' strokeWidth='0.2'>
      <circle cx='0' cy='0' r='0.9' />

      {/* up */}
      <line stroke={input.sec % 4 === 0 ? undefined : 'transparent'} x1='0' y1='0' x2='0' y2='-1' />

      {/* right */}
      <line stroke={input.sec % 4 === 1 ? undefined : 'transparent'} x1='0' y1='0' x2='1' y2='0' />

      {/* down */}
      <line stroke={input.sec % 4 === 2 ? undefined : 'transparent'} x1='0' y1='0' x2='0' y2='1' />

      {/* left */}
      <line stroke={input.sec % 4 === 3 ? undefined : 'transparent'} x1='0' y1='0' x2='-1' y2='0' />
    </svg>
  )
}
