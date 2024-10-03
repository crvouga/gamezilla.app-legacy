import { FlowPack } from '../../@/pack/flow-pack'
import { FlowPlay } from '../../@/flow/flow-play'
import { FlowPuzzleResult } from '../@/puzzle-result'
import type { CoreModule, MsgCore } from '../play.types'
import * as CopyPuzzleCore from './copy-puzzle/copy-puzzle.core'
import { LastPuzzleCore } from './last-puzzle/last-puzzle.core'
import type { ModelCore, MsgCoreEvt } from './screen-play-puzzle.types'

const updatePuzzleScreen: CoreModule['updateCore'] = (input) => {
  switch (input.modelCore.screen.t) {
    case 'screen-play-puzzle': {
      const screenPuzzle = updateScreen(input.modelCore.screen, input.msgCore)
      return {
        ...input.modelCore,
        screen: screenPuzzle
      }
    }
    default: {
      return input.modelCore
    }
  }
}

const updateScreen = (modelCore: ModelCore, msgCore: MsgCore): ModelCore & { events?: MsgCoreEvt[] } => {
  switch (msgCore.t) {
    case 'got-flow-play-msg': {
      if (modelCore.puzzleResult.t === 'not-found') {
        return modelCore
      }

      const flowPlay =
        modelCore.flowPlay ??
        FlowPlay.init({
          ctx: {
            flowPuzzle: modelCore.puzzleResult.c
          }
        })

      const flowPlayNew = FlowPlay.update({
        msg: msgCore.c,
        model: flowPlay,
        ctx: {
          flowPuzzle: modelCore.puzzleResult.c
        }
      })

      const didSolve = flowPlayNew.events?.some((e) => e.t === 'solved')

      return {
        ...modelCore,
        flowPlay: flowPlayNew.model,
        opened: didSolve ? 'puzzle-complete' : modelCore.opened,
        events: flowPlayNew.events?.flatMap((event) => {
          switch (event.t) {
            case 'used-hint': {
              return {
                t: 'user-used-hint',
                groupId: event.groupId,
                userId: msgCore.userId
              }
            }
            case 'solved': {
              return {
                t: 'user-completed-puzzle',
                packId: modelCore.flowPack.id,
                puzzleIndex: modelCore.puzzleIndex,
                userId: msgCore.userId
              }
            }
            default: {
              return []
            }
          }
        })
      }
    }
    case 'user-closed-puzzle-complete-dialog': {
      if (toStatus(modelCore) === 'solved' && modelCore.opened === 'puzzle-complete') {
        return {
          ...modelCore,
          opened: null
        }
      }

      return modelCore
    }

    case 'user-clicked-next-puzzle': {
      switch (msgCore.nextPuzzle.t) {
        case 'not-found': {
          return {
            ...modelCore,
            puzzleResult: msgCore.nextPuzzle,
            puzzleIndex: msgCore.nextPuzzleIndex
          }
        }

        case 'got': {
          return {
            ...modelCore,
            flowPlay: FlowPlay.init({
              ctx: {
                flowPuzzle: msgCore.nextPuzzle.c
              }
            }),
            opened: modelCore.opened === 'puzzle-complete' ? null : modelCore.opened,
            puzzleResult: msgCore.nextPuzzle,
            puzzleIndex: msgCore.nextPuzzleIndex
          }
        }
      }
    }

    case 'user-clicked-prev-puzzle': {
      switch (msgCore.prevPuzzle.t) {
        case 'got': {
          return {
            ...modelCore,
            flowPlay: FlowPlay.init({
              ctx: {
                flowPuzzle: msgCore.prevPuzzle.c
              }
            }),
            opened: modelCore.opened === 'puzzle-complete' ? null : modelCore.opened,
            puzzleResult: msgCore.prevPuzzle,
            puzzleIndex: msgCore.prevPuzzleIndex
          }
        }

        case 'not-found': {
          return {
            ...modelCore,
            puzzleResult: msgCore.prevPuzzle,
            puzzleIndex: msgCore.prevPuzzleIndex
          }
        }
      }
    }

    case 'user-clicked-reset-puzzle': {
      if (modelCore.puzzleResult.t === 'not-found') {
        return modelCore
      }
      return {
        ...modelCore,
        flowPlay: FlowPlay.init({
          ctx: {
            flowPuzzle: modelCore.puzzleResult.c
          }
        })
      }
    }

    case 'user-toggled-action-buttons-drawer': {
      return {
        ...modelCore,
        opened: modelCore.opened === 'action-drawer' ? null : 'action-drawer'
      }
    }

    default: {
      return modelCore
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
              slideIndex: 0
            }
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

const initCore = (input: { flowPack: FlowPack; flowPuzzle: FlowPuzzleResult; puzzleIndex: number }): ModelCore => {
  return {
    ...input,
    flowPlay:
      input.flowPuzzle.t === 'got'
        ? FlowPlay.init({
            ctx: {
              flowPuzzle: input.flowPuzzle.c
            }
          })
        : null,
    opened: null,
    t: 'screen-play-puzzle',
    hints: {},
    puzzleResult: input.flowPuzzle
  }
}

const updates = [
  updatePuzzleScreen,
  updateCoreMain,
  LastPuzzleCore.updateCore,
  CopyPuzzleCore.updateCore
  //
]
const updateCore: CoreModule['updateCore'] = (input) => {
  return updates.reduce(
    (acc, update) =>
      update({
        ...input,
        modelCore: acc
      }),
    input.modelCore
  )
}

const toStatus = (modelCore: ModelCore) => {
  if (modelCore.puzzleResult.t === 'not-found') {
    return 'not-playing'
  }

  const flowPlay = modelCore.flowPlay

  if (!flowPlay) {
    return 'solving'
  }

  return FlowPlay.toStatus({
    flow: modelCore.puzzleResult.c.flow,
    model: flowPlay
  })
}

export const ScreenPlayPuzzleCore = {
  updateCore,
  initCore,
  updateScreen,
  toStatus
}
