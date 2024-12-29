import { isErr } from '~/@/core'
import { FlowPack } from '../../@/pack/pack'
import { PackPuzzlesGridUI } from '../../@/pack/pack-puzzles-grid/ui'
import type { UpdateCore } from '../types'
import { EditPackNameCore } from './edit-pack-name/core'
import type { ModelCore } from './types'
import { FlowPlay } from '../../@/flow/flow-play'

const updates: UpdateCore[] = []

updates.push(({ modelCore, msgCore }) => {
  switch (msgCore.t) {
    case 'user-created-pack': {
      if (isErr(msgCore.created)) {
        return modelCore
      }

      return {
        ...modelCore,
        screen: {
          t: 'screen-pack-builder'
        },
        screenPackBuilder: init({
          pack: msgCore.created.value
        })
      }
    }
    default: {
      return modelCore
    }
  }
})

updates.push(({ modelCore, msgCore }) => {
  switch (msgCore.t) {
    case 'screen-pack-builder.user-clicked-add-puzzle-item': {
      if (!modelCore.screenPackBuilder) {
        return modelCore
      }
      return {
        ...modelCore,
        screenPackBuilder: {
          ...modelCore.screenPackBuilder,
          pack: FlowPack.add(modelCore.screenPackBuilder.pack, msgCore.puzzle.id),
          screen: {
            t: 'screen-puzzle-grid',
            slideIndex: 0
          },
          opened: {
            t: null
          }
        }
      }
    }
    default: {
      return modelCore
    }
  }
})

updates.push(({ modelCore, msgCore }) => {
  switch (msgCore.t) {
    case 'screen-pack-builder.user-opened-add-puzzle-screen': {
      if (!modelCore.screenPackBuilder) {
        return modelCore
      }
      return {
        ...modelCore,
        screenPackBuilder: {
          ...modelCore.screenPackBuilder,
          screen: {
            t: 'screen-add-puzzle'
          }
        }
      }
    }
    default: {
      return modelCore
    }
  }
})

updates.push(({ modelCore, msgCore }) => {
  switch (msgCore.t) {
    case 'screen-pack-builder.user-closed-add-puzzle-screen': {
      if (!modelCore.screenPackBuilder) {
        return modelCore
      }
      return {
        ...modelCore,
        screenPackBuilder: {
          ...modelCore.screenPackBuilder,
          opened: {
            t: null
          },
          screen: {
            t: 'screen-puzzle-grid'
          }
        }
      }
    }
    default: {
      return modelCore
    }
  }
})

updates.push(({ modelCore, msgCore }) => {
  switch (msgCore.t) {
    case 'screen-pack-builder.user-clicked-pack-item': {
      if (!modelCore.screenPackBuilder) {
        return modelCore
      }

      const puzzleId = modelCore.screenPackBuilder.pack.puzzleIds[msgCore.puzzleIndex]

      switch (msgCore.puzzle.t) {
        case 'not-found': {
          return modelCore
        }

        case 'got': {
          if (puzzleId !== msgCore.puzzle.c.id) {
            return modelCore
          }

          return {
            ...modelCore,
            screenPackBuilder: {
              ...modelCore.screenPackBuilder,
              screen: {
                opened: null,
                t: 'screen-puzzle',
                puzzleIndex: msgCore.puzzleIndex,
                puzzle: msgCore.puzzle.c,
                play: FlowPlay.init({
                  ctx: FlowPlay.initCtx({
                    flowPuzzle: msgCore.puzzle.c
                  })
                })
              }
            }
          }
        }
      }
    }

    default: {
      return modelCore
    }
  }
})

updates.push(({ modelCore, msgCore }) => {
  switch (msgCore.t) {
    case 'screen-pack-builder.puzzle-screen.user-clicked-exit-puzzle': {
      if (!modelCore.screenPackBuilder) {
        return modelCore
      }

      const puzzleIndex =
        modelCore.screenPackBuilder.screen.t === 'screen-puzzle' ? modelCore.screenPackBuilder.screen.puzzleIndex : null

      if (puzzleIndex === null) {
        return modelCore
      }

      const slideIndex = PackPuzzlesGridUI.toSlideIndex(puzzleIndex)

      return {
        ...modelCore,
        screenPackBuilder: {
          ...modelCore.screenPackBuilder,
          slideIndex: slideIndex,
          screen: {
            t: 'screen-puzzle-grid'
          }
        }
      }
    }

    default: {
      return modelCore
    }
  }
})

updates.push((input) => {
  switch (input.msgCore.t) {
    case 'screen-pack-builder.user-changed-slide': {
      if (!input.modelCore.screenPackBuilder) {
        return input.modelCore
      }
      return {
        ...input.modelCore,
        screenPackBuilder: {
          ...input.modelCore.screenPackBuilder,
          slideIndex: input.msgCore.newSlideIndex
        }
      }
    }
    default: {
      return input.modelCore
    }
  }
})

updates.push(({ modelCore, msgCore }) => {
  switch (msgCore.t) {
    case 'screen-pack-builder.got-flow-play-msg': {
      if (!modelCore.screenPackBuilder) {
        return modelCore
      }

      if (modelCore.screenPackBuilder.screen.t !== 'screen-puzzle') {
        return modelCore
      }

      const screen = modelCore.screenPackBuilder.screen

      const updated = FlowPlay.update({
        ctx: FlowPlay.initCtx({
          flowPuzzle: screen.puzzle
        }),
        model: screen.play,
        msg: msgCore.c
      })

      return {
        ...modelCore,
        screenPackBuilder: {
          ...modelCore.screenPackBuilder,
          screen: {
            opened: null,
            t: 'screen-puzzle',
            puzzleIndex: modelCore.screenPackBuilder.screen.puzzleIndex,
            puzzle: modelCore.screenPackBuilder.screen.puzzle,
            play: updated.model
          }
        }
      }
    }
    default: {
      return modelCore
    }
  }
})

updates.push(({ modelCore, msgCore }) => {
  if (modelCore.screenPackBuilder?.screen.t !== 'screen-puzzle') {
    return modelCore
  }

  switch (msgCore.t) {
    case 'screen-pack-builder.puzzle-screen.user-clicked-next-puzzle': {
      const indexOfNextPuzzle = modelCore.screenPackBuilder.pack.puzzleIds.indexOf(msgCore.nextPuzzle.id)
      if (indexOfNextPuzzle === -1) {
        return modelCore
      }
      return {
        ...modelCore,
        screenPackBuilder: {
          ...modelCore.screenPackBuilder,
          screen: {
            t: 'screen-puzzle',
            opened: null,
            puzzleIndex: clamp(
              modelCore.screenPackBuilder.screen.puzzleIndex + 1,
              0,
              modelCore.screenPackBuilder.pack.puzzleIds.length - 1
            ),
            play: FlowPlay.init({
              ctx: FlowPlay.initCtx({
                flowPuzzle: msgCore.nextPuzzle
              })
            }),
            puzzle: msgCore.nextPuzzle
          }
        }
      }
    }

    default: {
      return modelCore
    }
  }
})

updates.push(({ modelCore, msgCore }) => {
  if (modelCore.screenPackBuilder?.screen.t !== 'screen-puzzle') {
    return modelCore
  }

  switch (msgCore.t) {
    case 'screen-pack-builder.puzzle-screen.user-clicked-previous-puzzle-button': {
      const indexOfPreviousPuzzle = modelCore.screenPackBuilder.pack.puzzleIds.indexOf(msgCore.previousPuzzle.id)
      if (indexOfPreviousPuzzle === -1) {
        return modelCore
      }
      return {
        ...modelCore,
        screenPackBuilder: {
          ...modelCore.screenPackBuilder,
          screen: {
            t: 'screen-puzzle',
            opened: null,
            puzzleIndex: clamp(
              modelCore.screenPackBuilder.screen.puzzleIndex - 1,
              0,
              modelCore.screenPackBuilder.pack.puzzleIds.length - 1
            ),
            play: FlowPlay.init({
              ctx: FlowPlay.initCtx({
                flowPuzzle: msgCore.previousPuzzle
              })
            }),
            puzzle: msgCore.previousPuzzle
          }
        }
      }
    }
    default: {
      return modelCore
    }
  }
})

updates.push(({ modelCore, msgCore }) => {
  switch (msgCore.t) {
    case 'screen-pack-builder.puzzle-screen.user-clicked-more-button': {
      if (!modelCore.screenPackBuilder) {
        return modelCore
      }
      return {
        ...modelCore,
        screenPackBuilder: {
          ...modelCore.screenPackBuilder,
          screen: {
            ...modelCore.screenPackBuilder.screen,
            opened: 'more'
          }
        }
      }
    }
    case 'screen-pack-builder.puzzle-screen.user-closed-more-drawer': {
      if (!modelCore.screenPackBuilder) {
        return modelCore
      }
      return {
        ...modelCore,
        screenPackBuilder: {
          ...modelCore.screenPackBuilder,
          screen: {
            ...modelCore.screenPackBuilder.screen,
            opened: null
          }
        }
      }
    }
    default: {
      return modelCore
    }
  }
})

const clamp = (value: number, min: number, max: number): number => {
  return Math.max(min, Math.min(max, value))
}

updates.push(({ modelCore, msgCore }) => {
  switch (msgCore.t) {
    case 'remove-puzzle-from-pack.user-clicked-remove-from-pack-button': {
      if (!modelCore.screenPackBuilder) {
        return modelCore
      }

      const pack = modelCore.screenPackBuilder.pack

      const packNew = FlowPack.remove(pack, msgCore.puzzleIndex)

      return {
        ...modelCore,
        screenPackBuilder: {
          ...modelCore.screenPackBuilder,
          pack: packNew,
          screen: {
            t: 'screen-puzzle-grid'
          }
        }
      }
    }
    default: {
      return modelCore
    }
  }
})

updates.push((input) => {
  if (!input.modelCore.screenPackBuilder) {
    return input.modelCore
  }

  return {
    ...input.modelCore,
    screenPackBuilder: {
      ...input.modelCore.screenPackBuilder,
      slideIndex: PackPuzzlesGridUI.clampSlideIndex(
        input.modelCore.screenPackBuilder.slideIndex,
        input.modelCore.screenPackBuilder.pack.puzzleIds.length
      )
    }
  }
})

const update: UpdateCore = (input) => {
  return updates.reduce(
    (modelCore, updateCore) => updateCore({ ctx: input.ctx, msgCore: input.msgCore, modelCore }),
    input.modelCore
  )
}

const init = ({ pack }: { pack: FlowPack }): ModelCore => {
  return {
    editPackName: EditPackNameCore.init({ pack }),
    pack,
    slideIndex: 0,
    screen: {
      t: 'screen-puzzle-grid'
    }
  }
}

const toSlideIndex = (modelCore?: ModelCore | null | undefined): number => {
  return modelCore?.slideIndex ?? 0
}

export const ScreenPackBuilderCore = {
  toSlideIndex,
  init,
  update
}
