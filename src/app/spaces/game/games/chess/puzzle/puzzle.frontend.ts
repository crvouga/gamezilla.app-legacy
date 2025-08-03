import { Eff } from '~/@/eff'
import { TranslatedText } from '~/@/l18n'
import { Translator } from '~/@/l18n/generated'
import { isErr } from '~/@/result'
import { Avatar } from '~/@/ui/avatar'
import {
  IconArrowLeft,
  IconArrowRight,
  IconArrowRightCircle,
  IconArrowRotateLeft,
  IconCheckmarkCircle,
  IconLightbulb,
  IconXMark,
} from '~/@/ui/icon'
import { Paper } from '~/@/ui/paper'
import { Spinner } from '~/@/ui/spinner'
import { theme } from '~/@/ui/theme/theme'
import { Typography } from '~/@/ui/typography'
import { h } from '~/@/vdom/h'
import { Box } from '~/@/vdom/primitives/box'
import { Circle } from '~/@/vdom/primitives/svg/circle'
import { Line } from '~/@/vdom/primitives/svg/line'
import { Svg } from '~/@/vdom/primitives/svg/svg'
import { Text } from '~/@/vdom/primitives/text'
import { UserProfile } from '~/app/@/data/user-profile'
import { APP_SOUND } from '~/app/@/frontend/app-sound'
import { PlaySoundCmd } from '~/app/@/frontend/play-sound-cmd.$msg'
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
            msgOut: [PlaySoundCmd.init(CHESS_SOUND.captureSound)],
          }
        }
        return {
          model,
          msgOut: [PlaySoundCmd.init(CHESS_SOUND.moveSound)],
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
          msgOut: [PlaySoundCmd.init(APP_SOUND.alertErrorMd)],
        }
      }
      if (!isSolved(input.model) && isSolved(model)) {
        return {
          model,
          msgOut: [PlaySoundCmd.init(APP_SOUND.celebration)],
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
} => {
  const updated = updateSpace({ msg, model, ctx })

  const modelNew = mergeWithBackend({
    frontend: model,
    backend: updated.t === 'err' ? model : updated.value,
  })

  return {
    model: modelNew,
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
  return h(LayoutGame, { ctx, isSpectating }, [
    h(ViewStatusBar, { model }),

    h(
      Box,
      {
        style: theme({ flexDirection: 'col', width: 'full', flex: 1, alignItems: 'center', justifyContent: 'center' }),
      },
      [
        h(Box, { style: theme({ flexDirection: 'row', width: 'full', alignItems: 'center', gap: 2, px: 3, py: 2 }) }, [
          h(Avatar, {
            src: UserProfile.toAvatarUrl(ctx.profilesByUserId[ctx.space.hostId]),
            style: theme({ size: 10 }),
            alt: '',
          }),

          h(Box, { style: theme({ flexDirection: 'col', flex: 1, justifyContent: 'center' }) }, [
            h(Typography, {
              text: TranslatedText.of('Rating'),
              variant: 'label',
              color: 'text-secondary',
              style: theme({ textSize: 'xs' }),
            }),
            h(Box, { style: theme({ flexDirection: 'row', alignItems: 'center', gap: 1 }) }, [
              h(Box, { style: theme({ textSize: 'xl', fontWeight: 'semibold' }) }, [
                h(Text, { text: String(model.profile?.eloRating ?? '...') }),
              ]),

              model.t === 'solved' &&
                !model.hasLost &&
                nextEloRating &&
                h(
                  Box,
                  { style: theme({ rounded: 'xl', textSize: 'lg', fontWeight: 'semibold', textColor: 'green-500' }) },
                  [h(Text, { text: `+${nextEloRating - model.profile.eloRating}` })],
                ),

              model.t !== 'loading' &&
                model.hasLost &&
                nextEloRating &&
                h(
                  Box,
                  { style: theme({ rounded: 'xl', textSize: 'lg', fontWeight: 'semibold', textColor: 'red-500' }) },
                  [h(Text, { text: String(nextEloRating - model.profile.eloRating) })],
                ),
            ]),
          ]),

          h(Box, { style: theme({ flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', gap: 2 }) }, [
            h(TickingClock, { sec: durationMs ? Math.floor(durationMs / 1_000) : 0 }),
            h(Typography, {
              text: TranslatedText.of(durationMs ? formatDuration(durationMs) : '-:--'),
              color: 'text-secondary',
              style: theme({ fontWeight: 'bold', textSize: 'lg' }),
            }),
          ]),
        ]),

        h(
          Paper,
          {
            style: theme({
              position: 'relative',
              flexDirection: 'row',
              aspectRatio: 1,
              width: 'full',
              alignItems: 'center',
              justifyContent: 'flex-end',
              overflow: 'hidden',
            }),
          },
          [
            h(Chessboard, {
              id: 'puzzle-chess-board',
              orientation: model.t === 'loading' ? undefined : toPlayerColor(model.puzzle),
              model: model.t === 'loading' ? undefined : toCurrentBoard(model),
              isPieceDraggable: (input) => {
                if (model.t !== 'started') {
                  return false
                }
                const color = Chess.toColor(input.piece)
                return color === toPlayerColor(model.puzzle) && ctx.space.hostId === ctx.currentUser.userId
              },
              onPieceDrop: (input) => {
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
              },
            }),
            model.t === 'loading' &&
              h(
                Box,
                {
                  style: theme({
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    zIndex: 20,
                    width: 'full',
                    height: 'full',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: 'black/50',
                  }),
                },
                [h(Spinner, { style: theme({ size: 12 }) })],
              ),
          ],
        ),

        h(Box, { style: theme({ width: 'full', px: 2, py: 1 }) }, [
          h(
            Box,
            {
              style: theme({
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'flex-start',
                gap: 1,
                textSize: 'xs',
              }),
            },
            [
              h(Typography, { text: TranslatedText.of('Puzzle Rating'), color: 'text-secondary' }),
              h(Box, {}, [h(Text, { text: model.t === 'loading' ? '...' : String(model.puzzle.rating) })]),
            ],
          ),

          h(
            Box,
            {
              style: theme({
                flexDirection: 'row',
                flex: 1,
                alignItems: 'center',
                justifyContent: 'flex-end',
                gap: 1,
                textAlign: 'right',
                textSize: 'xs',
              }),
            },
            [
              h(Typography, { text: TranslatedText.of('Moved'), color: 'text-secondary' }),
              h(Typography, {
                text: TranslatedText.of(model.t === 'loading' ? '0' : (model.moves?.length ?? '0').toString()),
                color: 'inherit',
              }),
              h(Typography, { text: TranslatedText.of('out of'), color: 'text-secondary' }),
              h(Typography, {
                text: TranslatedText.of(model.t === 'loading' ? '0' : (model.puzzle?.moves?.length ?? '0').toString()),
                color: 'inherit',
              }),
            ],
          ),
        ]),
      ],
    ),
  ])
}

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
    renderIcon: (input) => h(IconArrowLeft, input),
    label: ctx.t('app.exit'),
    onPress: onClose,
  }

  const hint: ScreenAction = {
    id: ctx.t('game.hint'),
    renderIcon: (input) => h(IconLightbulb, input),
    label: ctx.t('game.hint'),
    disabled: isNoMoreHints(model) || model.t === 'loading',
    onPress: () =>
      dispatch({
        t: 'show-hint',
      }),
  }

  const retry: ScreenAction = {
    id: ctx.t('app.retry'),
    renderIcon: (input) => h(IconArrowRotateLeft, input),
    label: ctx.t('app.retry'),
    onPress: () =>
      dispatch({
        t: 'retry',
      }),
    color: 'danger',
  }

  const skip: ScreenAction = {
    id: ctx.t('app.skip'),
    renderIcon: (input) => h(IconArrowRight, input),
    label: ctx.t('app.skip'),
    onPress: () =>
      dispatch({
        t: 'skip',
      }),
  }

  const next: ScreenAction = {
    id: ctx.t('app.next'),
    renderIcon: (input) => h(IconArrowRightCircle, input),
    label: ctx.t('app.next'),
    color: 'success',
    onPress: () => dispatch({ t: 'next' }),
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
    return h(
      Box,
      { style: theme({ flexDirection: 'row', width: 'full', alignItems: 'center', justifyContent: 'center', p: 2 }) },
      [h(Box, { style: theme({ textSize: 'xl' }) }, [h(Text, { text: '...' })])],
    )
  }

  if (input.model.t === 'incorrect') {
    return h(
      Box,
      {
        style: theme({
          flexDirection: 'row',
          width: 'full',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 2,
          backgroundColor: 'red-500',
          p: 2,
          textColor: 'white',
        }),
      },
      [
        h(IconXMark, { style: theme({ size: 6 }) }),
        h(Box, { style: theme({ textSize: 'xl' }) }, [h(Text, { text: 'Incorrect' })]),
      ],
    )
  }

  if (input.model.t === 'solved') {
    return h(
      Box,
      {
        style: theme({
          flexDirection: 'row',
          width: 'full',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 2,
          backgroundColor: 'green-500',
          p: 2,
          textColor: 'white',
        }),
      },
      [
        h(IconCheckmarkCircle, { style: theme({ size: 6 }) }),
        h(Box, { style: theme({ textSize: 'xl' }) }, [h(Text, { text: 'Correct' })]),
      ],
    )
  }

  if (input.model.t === 'started') {
    const playerColor = toPlayerColor(input.model.puzzle)
    return h(
      Box,
      {
        style: theme({
          flexDirection: 'row',
          width: 'full',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 2,
          p: 2,
          backgroundColor: playerColor === 'b' ? 'black' : 'white',
          textColor: playerColor === 'b' ? 'white' : 'black',
        }),
      },
      [
        h(Box, {
          style: theme({
            size: 6,
            rounded: 'full',
            borderWidth: 2,
            borderColor: playerColor === 'b' ? '[#ababab]' : 'black',
            backgroundColor: playerColor === 'b' ? 'black' : 'white',
          }),
        }),
        h(Box, { style: theme({ textSize: 'xl' }) }, [
          h(Text, { text: `${Chess.colorToString(playerColor)} to move` }),
        ]),
      ],
    )
  }

  if (input.model.t === 'solved-with-hint') {
    return h(
      Paper,
      {
        style: theme({
          flexDirection: 'row',
          width: 'full',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 2,
          p: 2,
          textColor: 'white',
        }),
      },
      [
        h(IconCheckmarkCircle, { style: theme({ size: 6 }) }),
        h(Box, { style: theme({ textSize: 'xl' }) }, [h(Text, { text: 'Solved with hint' })]),
      ],
    )
  }

  return h(Box, {})
}

const TickingClock = (input: { sec: number }) => {
  return h(Svg, { style: theme({ size: 5 }), viewBox: '-1 -1 2 2', stroke: 'currentColor', 'stroke-width': '0.2' }, [
    h(Circle, { cx: '0', cy: '0', r: '0.9' }),
    h(Line, {
      stroke: input.sec % 4 === 0 ? undefined : 'transparent',
      x1: '0',
      y1: '0',
      x2: '0',
      y2: '-1',
    }),
    h(Line, {
      stroke: input.sec % 4 === 1 ? undefined : 'transparent',
      x1: '0',
      y1: '0',
      x2: '1',
      y2: '0',
    }),
    h(Line, {
      stroke: input.sec % 4 === 2 ? undefined : 'transparent',
      x1: '0',
      y1: '0',
      x2: '0',
      y2: '1',
    }),
    h(Line, {
      stroke: input.sec % 4 === 3 ? undefined : 'transparent',
      x1: '0',
      y1: '0',
      x2: '-1',
      y2: '0',
    }),
  ])
}
