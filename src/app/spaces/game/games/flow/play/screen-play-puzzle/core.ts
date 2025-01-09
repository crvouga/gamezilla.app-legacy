import { FlowCoreCtx } from '../../@/core/ctx'
import { Pack } from '../../@/pack/pack'
import { Play } from '../../@/play'
import { PuzzleResult } from '../../@/puzzle/puzzle-result'
import type { CoreModule, MsgCore } from '../types'
import * as CopyPuzzleCore from './copy-puzzle/core'
import { LastPuzzleCore } from './last-puzzle/core'
import type { ModelCore, MsgCoreEvt } from './types'

const updatePuzzleScreen: CoreModule['updateCore'] = (input) => {
  switch (input.modelCore.screen.t) {
    case 'screen-play-puzzle': {
      const screenPuzzle = updateScreen({ modelCore: input.modelCore.screen, msgCore: input.msgCore, ctx: input.ctx })
      return {
        ...input.modelCore,
        screen: screenPuzzle,
      }
    }
    default: {
      return input.modelCore
    }
  }
}

const updateScreen = (input: {
  modelCore: ModelCore
  msgCore: MsgCore
  ctx: FlowCoreCtx
}): ModelCore & { events?: MsgCoreEvt[] } => {
  switch (input.msgCore.t) {
    case 'got-flow-play-msg': {
      if (input.modelCore.puzzleResult.t === 'not-found') {
        return input.modelCore
      }

      const playMode =
        input.modelCore.playMode ??
        Play.init({
          ctx: Play.initCtx({
            flow: input.modelCore.puzzleResult.c.flow,
            solutions: input.ctx.solutions,
          }),
        })

      const playModeNew = Play.update({
        msg: input.msgCore.c,
        model: playMode,
        ctx: Play.initCtx({
          flow: input.modelCore.puzzleResult.c.flow,
          solutions: input.ctx.solutions,
        }),
      })

      const didSolve = playModeNew.events?.some((e) => e.t === 'solved')
      const userId = input.msgCore.userId

      return {
        ...input.modelCore,
        playMode: playModeNew.model,
        opened: didSolve ? 'puzzle-complete' : input.modelCore.opened,
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
                packId: input.modelCore.flowPack.id,
                puzzleIndex: input.modelCore.puzzleIndex,
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
      if (toStatus(input.modelCore) === 'solved' && input.modelCore.opened === 'puzzle-complete') {
        return {
          ...input.modelCore,
          opened: null,
        }
      }

      return input.modelCore
    }

    case 'user-clicked-next-puzzle': {
      switch (input.msgCore.nextPuzzle.t) {
        case 'not-found': {
          return {
            ...input.modelCore,
            puzzleResult: input.msgCore.nextPuzzle,
            puzzleIndex: input.msgCore.nextPuzzleIndex,
          }
        }

        case 'got': {
          return {
            ...input.modelCore,
            playMode: Play.init({
              ctx: Play.initCtx({
                flow: input.msgCore.nextPuzzle.c.flow,
                solutions: input.ctx.solutions,
              }),
            }),
            opened: input.modelCore.opened === 'puzzle-complete' ? null : input.modelCore.opened,
            puzzleResult: input.msgCore.nextPuzzle,
            puzzleIndex: input.msgCore.nextPuzzleIndex,
          }
        }
      }
    }

    case 'user-clicked-prev-puzzle': {
      switch (input.msgCore.prevPuzzle.t) {
        case 'got': {
          return {
            ...input.modelCore,
            playMode: Play.init({
              ctx: Play.initCtx({
                flow: input.msgCore.prevPuzzle.c.flow,
                solutions: input.ctx.solutions,
              }),
            }),
            opened: input.modelCore.opened === 'puzzle-complete' ? null : input.modelCore.opened,
            puzzleResult: input.msgCore.prevPuzzle,
            puzzleIndex: input.msgCore.prevPuzzleIndex,
          }
        }

        case 'not-found': {
          return {
            ...input.modelCore,
            puzzleResult: input.msgCore.prevPuzzle,
            puzzleIndex: input.msgCore.prevPuzzleIndex,
          }
        }
      }
    }

    case 'user-clicked-reset-puzzle': {
      if (input.modelCore.puzzleResult.t === 'not-found') {
        return input.modelCore
      }
      return {
        ...input.modelCore,
        playMode: Play.init({
          ctx: Play.initCtx({
            flow: input.modelCore.puzzleResult.c.flow,
            solutions: input.ctx.solutions,
          }),
        }),
      }
    }

    case 'user-toggled-action-buttons-drawer': {
      return {
        ...input.modelCore,
        opened: input.modelCore.opened === 'action-drawer' ? null : 'action-drawer',
      }
    }

    default: {
      return input.modelCore
    }
  }
}

const updateCoreMain: CoreModule['updateCore'] = ({ modelCore, msgCore }) => {
  switch (msgCore.t) {
    case 'user-clicked-exit-puzzle': {
      switch (modelCore.screen.t) {
        case 'screen-play-puzzle': {
          return {
            ...modelCore,
            screen: {
              t: 'screen-select-puzzle',
              flowPack: modelCore.screen.flowPack,
              slideIndex: 0,
            },
          }
        }
        default: {
          return modelCore
        }
      }
    }
    default: {
      return modelCore
    }
  }
}

const initCore = (input: {
  flowPack: Pack
  flowPuzzle: PuzzleResult
  puzzleIndex: number
  ctx: FlowCoreCtx
}): ModelCore => {
  return {
    ...input,
    playMode:
      input.flowPuzzle.t === 'got'
        ? Play.init({
            ctx: Play.initCtx({
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
  updateCoreMain,
  LastPuzzleCore.updateCore,
  CopyPuzzleCore.updateCore,
  //
]
const updateCore: CoreModule['updateCore'] = (input) => {
  return updates.reduce(
    (acc, update) =>
      update({
        ...input,
        modelCore: acc,
      }),
    input.modelCore,
  )
}

const toStatus = (modelCore: ModelCore) => {
  if (modelCore.puzzleResult.t === 'not-found') {
    return 'not-playing'
  }

  const playMode = modelCore.playMode

  if (!playMode) {
    return 'solving'
  }

  return Play.toStatus({
    flow: modelCore.puzzleResult.c.flow,
    model: playMode,
  })
}

export const ScreenPlayPuzzleCore = {
  updateCore,
  initCore,
  updateScreen,
  toStatus,
}
