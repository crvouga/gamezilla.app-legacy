import { ModePlay } from '../../@/mode-play'
import { Pack } from '../../@/pack/pack'
import { PackPuzzleGridUI } from '../../@/pack/pack-puzzle-grid-ui'
import { PuzzleResult } from '../../@/puzzle/puzzle-result'
import { FlowSpaceCtx } from '../../@/space/ctx'
import type { MsgSpace, SpaceModule } from '../types'
import * as CopyPuzzleSpace from './button-copy-puzzle/space'
import { LastPuzzleSpace } from './dialog-last-puzzle/space'
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

      const modelPlay =
        input.modelSpace.modePlay ??
        ModePlay.init({
          ctx: ModePlay.initCtx({
            flow: input.modelSpace.puzzleResult.c.flow,
            solutions: {},
          }),
        })

      const modelPlayNew = ModePlay.update({
        msg: input.msgSpace.c,
        model: modelPlay,
        ctx: ModePlay.initCtx({ flow: input.modelSpace.puzzleResult.c.flow, solutions: {} }),
      })

      const didSolve = modelPlayNew.events?.some((e) => e.t === 'solved')
      const userId = input.msgSpace.userId

      return {
        ...input.modelSpace,
        modePlay: modelPlayNew.model,
        opened: didSolve ? 'puzzle-complete' : input.modelSpace.opened,
        events: modelPlayNew.events?.flatMap((event) => {
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
                packId: input.modelSpace.pack.id,
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
            modePlay: ModePlay.init({
              ctx: ModePlay.initCtx({
                flow: input.msgSpace.nextPuzzle.c.flow,
                solutions: {},
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
            modePlay: ModePlay.init({
              ctx: ModePlay.initCtx({
                flow: input.msgSpace.prevPuzzle.c.flow,
                solutions: {},
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
    case 'user-clicked-exit-play-puzzle-screen': {
      switch (modelSpace.screen.t) {
        case 'screen-play-puzzle': {
          return {
            ...modelSpace,
            screen: {
              t: 'screen-select-puzzle',
              pack: modelSpace.screen.pack,
              slideIndex: PackPuzzleGridUI.toSlideIndex(modelSpace.screen.puzzleIndex),
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

const initSpace = (input: { pack: Pack; puzzle: PuzzleResult; puzzleIndex: number; ctx: FlowSpaceCtx }): ModelSpace => {
  return {
    pack: input.pack,
    puzzleIndex: input.puzzleIndex,
    modePlay:
      input.puzzle.t === 'got'
        ? ModePlay.init({ ctx: ModePlay.initCtx({ flow: input.puzzle.c.flow, solutions: {} }) })
        : null,
    opened: null,
    t: 'screen-play-puzzle',
    hints: {},
    puzzleResult: input.puzzle,
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
  return updates.reduce((acc, update) => update({ ...input, modelSpace: acc }), input.modelSpace)
}

const toStatus = (modelSpace: ModelSpace) => {
  if (modelSpace.puzzleResult.t === 'not-found') {
    return 'not-playing'
  }

  const modelPlay = modelSpace.modePlay

  if (!modelPlay) {
    return 'solving'
  }

  return ModePlay.toStatus({
    flow: modelSpace.puzzleResult.c.flow,
    model: modelPlay,
  })
}

export const ScreenPlayPuzzleSpace = {
  updateSpace,
  initSpace,
  updateScreen,
  toStatus,
}
