import { FlowSpaceCtx } from '../../@/space/ctx'
import { Pack } from '../../@/pack/pack'
import { PlayMode } from '../../@/play-mode'
import { PuzzleResult } from '../../@/puzzle/puzzle-result'
import type { SpaceModule, MsgSpace } from '../types'
import * as CopyPuzzleSpace from './copy-puzzle/space'
import { LastPuzzleSpace } from './last-puzzle/space'
import type { ModelSpace, MsgSpaceEvt } from './types'

const updatePuzzleScreen: SpaceModule['updateSpace'] = (input) => {
  switch (input.modelSpace.screen.t) {
    case 'screen-play-puzzle': {
      const screenPuzzle = updateScreen({
        modelSpace: input.modelSpace.screen,
        msgSpace: input.msgSpace,
        ctx: input.ctx,
      })
      return {
        ...input.modelSpace,
        screen: screenPuzzle,
      }
    }
    default: {
      return input.modelSpace
    }
  }
}

const updateScreen = (input: {
  modelSpace: ModelSpace
  msgSpace: MsgSpace
  ctx: FlowSpaceCtx
}): ModelSpace & { events?: MsgSpaceEvt[] } => {
  switch (input.msgSpace.t) {
    case 'got-flow-play-msg': {
      if (input.modelSpace.puzzleResult.t === 'not-found') {
        return input.modelSpace
      }

      const playMode =
        input.modelSpace.playMode ??
        PlayMode.init({
          ctx: PlayMode.initCtx({
            flow: input.modelSpace.puzzleResult.c.flow,
            solutions: input.ctx.solutions,
          }),
        })

      const playModeNew = PlayMode.update({
        msg: input.msgSpace.c,
        model: playMode,
        ctx: PlayMode.initCtx({
          flow: input.modelSpace.puzzleResult.c.flow,
          solutions: input.ctx.solutions,
        }),
      })

      const didSolve = playModeNew.events?.some((e) => e.t === 'solved')
      const userId = input.msgSpace.userId

      return {
        ...input.modelSpace,
        playMode: playModeNew.model,
        opened: didSolve ? 'puzzle-complete' : input.modelSpace.opened,
        events: playModeNew.events?.flatMap((event) => {
          switch (event.t) {
            case 'used-hint': {
              return {
                t: 'user-used-hint',
                groupId: event.groupId,
                userId,
              }
            }
            case 'solved': {
              return {
                t: 'user-completed-puzzle',
                packId: input.modelSpace.flowPack.id,
                puzzleIndex: input.modelSpace.puzzleIndex,
                userId,
              }
            }
            default: {
              return []
            }
          }
        }),
      }
    }
    case 'user-closed-puzzle-complete-dialog': {
      if (toStatus(input.modelSpace) === 'solved' && input.modelSpace.opened === 'puzzle-complete') {
        return {
          ...input.modelSpace,
          opened: null,
        }
      }

      return input.modelSpace
    }

    case 'user-clicked-next-puzzle': {
      switch (input.msgSpace.nextPuzzle.t) {
        case 'not-found': {
          return {
            ...input.modelSpace,
            puzzleResult: input.msgSpace.nextPuzzle,
            puzzleIndex: input.msgSpace.nextPuzzleIndex,
          }
        }

        case 'got': {
          return {
            ...input.modelSpace,
            playMode: PlayMode.init({
              ctx: PlayMode.initCtx({
                flow: input.msgSpace.nextPuzzle.c.flow,
                solutions: input.ctx.solutions,
              }),
            }),
            opened: input.modelSpace.opened === 'puzzle-complete' ? null : input.modelSpace.opened,
            puzzleResult: input.msgSpace.nextPuzzle,
            puzzleIndex: input.msgSpace.nextPuzzleIndex,
          }
        }
      }
    }

    case 'user-clicked-prev-puzzle': {
      switch (input.msgSpace.prevPuzzle.t) {
        case 'got': {
          return {
            ...input.modelSpace,
            playMode: PlayMode.init({
              ctx: PlayMode.initCtx({
                flow: input.msgSpace.prevPuzzle.c.flow,
                solutions: input.ctx.solutions,
              }),
            }),
            opened: input.modelSpace.opened === 'puzzle-complete' ? null : input.modelSpace.opened,
            puzzleResult: input.msgSpace.prevPuzzle,
            puzzleIndex: input.msgSpace.prevPuzzleIndex,
          }
        }

        case 'not-found': {
          return {
            ...input.modelSpace,
            puzzleResult: input.msgSpace.prevPuzzle,
            puzzleIndex: input.msgSpace.prevPuzzleIndex,
          }
        }
      }
    }

    case 'user-clicked-reset-puzzle': {
      if (input.modelSpace.puzzleResult.t === 'not-found') {
        return input.modelSpace
      }
      return {
        ...input.modelSpace,
        playMode: PlayMode.init({
          ctx: PlayMode.initCtx({
            flow: input.modelSpace.puzzleResult.c.flow,
            solutions: input.ctx.solutions,
          }),
        }),
      }
    }

    case 'user-toggled-action-buttons-drawer': {
      return {
        ...input.modelSpace,
        opened: input.modelSpace.opened === 'action-drawer' ? null : 'action-drawer',
      }
    }

    default: {
      return input.modelSpace
    }
  }
}

const updateSpaceMain: SpaceModule['updateSpace'] = ({ modelSpace, msgSpace }) => {
  switch (msgSpace.t) {
    case 'user-clicked-exit-puzzle': {
      switch (modelSpace.screen.t) {
        case 'screen-play-puzzle': {
          return {
            ...modelSpace,
            screen: {
              t: 'screen-select-puzzle',
              pack: modelSpace.screen.flowPack,
              slideIndex: 0,
            },
          }
        }
        default: {
          return modelSpace
        }
      }
    }
    default: {
      return modelSpace
    }
  }
}

const initSpace = (input: {
  flowPack: Pack
  flowPuzzle: PuzzleResult
  puzzleIndex: number
  ctx: FlowSpaceCtx
}): ModelSpace => {
  return {
    ...input,
    playMode:
      input.flowPuzzle.t === 'got'
        ? PlayMode.init({
            ctx: PlayMode.initCtx({
              flow: input.flowPuzzle.c.flow,
              solutions: input.ctx.solutions,
            }),
          })
        : null,
    opened: null,
    t: 'screen-play-puzzle',
    hints: {},
    puzzleResult: input.flowPuzzle,
  }
}

const updates = [
  updatePuzzleScreen,
  updateSpaceMain,
  LastPuzzleSpace.updateSpace,
  CopyPuzzleSpace.updateSpace,
  //
]
const updateSpace: SpaceModule['updateSpace'] = (input) => {
  return updates.reduce(
    (acc, update) =>
      update({
        ...input,
        modelSpace: acc,
      }),
    input.modelSpace,
  )
}

const toStatus = (modelSpace: ModelSpace) => {
  if (modelSpace.puzzleResult.t === 'not-found') {
    return 'not-playing'
  }

  const playMode = modelSpace.playMode

  if (!playMode) {
    return 'solving'
  }

  return PlayMode.toStatus({
    flow: modelSpace.puzzleResult.c.flow,
    model: playMode,
  })
}

export const ScreenPlayPuzzleSpace = {
  updateSpace,
  initSpace,
  updateScreen,
  toStatus,
}
