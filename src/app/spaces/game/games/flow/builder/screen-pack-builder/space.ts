import { isErr } from '~/@/result'
import { Pack } from '../../@/pack/pack'
import { PackPuzzleGridUI } from '../../@/pack/pack-puzzle-grid-ui'
import type { UpdateSpace } from '../types'
import { EditPackNameSpace } from './edit-pack-name/space'
import type { ModelSpace } from './types'
import { PlayMode } from '../../@/play-mode'

const init = ({ pack }: { pack: Pack }): ModelSpace => {
  return {
    editPackName: EditPackNameSpace.init({ pack }),
    pack,
    slideIndex: 0,
    screen: {
      t: 'screen-puzzle-grid',
    },
  }
}

const updates: UpdateSpace[] = []

const update: UpdateSpace = (input) => {
  const { ctx, msgSpace, modelSpace } = input
  return updates.reduce((modelSpace, updateSpace) => updateSpace({ ctx, msgSpace, modelSpace }), modelSpace)
}

updates.push(({ modelSpace, msgSpace }) => {
  switch (msgSpace.t) {
    case 'create-new-pack.user-created-pack': {
      if (isErr(msgSpace.created)) {
        return modelSpace
      }

      return {
        ...modelSpace,
        screen: {
          t: 'screen-pack-builder',
        },
        screenPackBuilder: init({
          pack: msgSpace.created.value,
        }),
      }
    }
    default: {
      return modelSpace
    }
  }
})

updates.push(({ modelSpace, msgSpace }) => {
  switch (msgSpace.t) {
    case 'screen-pack-builder.user-clicked-add-puzzle-item': {
      if (!modelSpace.screenPackBuilder) {
        return modelSpace
      }
      return {
        ...modelSpace,
        screenPackBuilder: {
          ...modelSpace.screenPackBuilder,
          pack: Pack.add(modelSpace.screenPackBuilder.pack, msgSpace.puzzle.id),
          screen: {
            t: 'screen-puzzle-grid',
            slideIndex: 0,
          },
          opened: {
            t: null,
          },
        },
      }
    }
    default: {
      return modelSpace
    }
  }
})

updates.push(({ modelSpace, msgSpace }) => {
  switch (msgSpace.t) {
    case 'screen-pack-builder.user-clicked-open-add-puzzle-screen-button': {
      if (!modelSpace.screenPackBuilder) {
        return modelSpace
      }
      return {
        ...modelSpace,
        screenPackBuilder: {
          ...modelSpace.screenPackBuilder,
          screen: {
            t: 'screen-add-puzzle',
          },
        },
      }
    }
    default: {
      return modelSpace
    }
  }
})

updates.push(({ modelSpace, msgSpace }) => {
  switch (msgSpace.t) {
    case 'screen-pack-builder.user-closed-add-puzzle-screen': {
      if (!modelSpace.screenPackBuilder) {
        return modelSpace
      }
      return {
        ...modelSpace,
        screenPackBuilder: {
          ...modelSpace.screenPackBuilder,
          opened: {
            t: null,
          },
          screen: {
            t: 'screen-puzzle-grid',
          },
        },
      }
    }
    default: {
      return modelSpace
    }
  }
})

updates.push(({ modelSpace, msgSpace, ctx }) => {
  switch (msgSpace.t) {
    case 'screen-pack-builder.user-clicked-pack-item': {
      if (!modelSpace.screenPackBuilder) {
        return modelSpace
      }

      const puzzleId = modelSpace.screenPackBuilder.pack.puzzleIds[msgSpace.puzzleIndex]

      if (msgSpace.puzzleResult.t === 'got' && msgSpace.puzzleResult.c.id !== puzzleId) {
        return modelSpace
      }

      return {
        ...modelSpace,
        screenPackBuilder: {
          ...modelSpace.screenPackBuilder,
          screen: {
            opened: null,
            t: 'screen-puzzle',
            puzzleIndex: msgSpace.puzzleIndex,
            puzzleResult: msgSpace.puzzleResult,
            play:
              msgSpace.puzzleResult.t === 'got'
                ? PlayMode.init({
                    ctx: PlayMode.initCtx({
                      flow: msgSpace.puzzleResult.c.flow,
                      solutions: ctx.solutions,
                    }),
                  })
                : null,
          },
        },
      }
    }

    default: {
      return modelSpace
    }
  }
})

updates.push(({ modelSpace, msgSpace }) => {
  switch (msgSpace.t) {
    case 'screen-pack-builder.puzzle-screen.user-clicked-exit-puzzle': {
      if (!modelSpace.screenPackBuilder) {
        return modelSpace
      }

      const puzzleIndex =
        modelSpace.screenPackBuilder.screen.t === 'screen-puzzle'
          ? modelSpace.screenPackBuilder.screen.puzzleIndex
          : null

      if (puzzleIndex === null) {
        return modelSpace
      }

      const slideIndex = PackPuzzleGridUI.toSlideIndex(puzzleIndex)

      return {
        ...modelSpace,
        screenPackBuilder: {
          ...modelSpace.screenPackBuilder,
          slideIndex: slideIndex,
          screen: {
            t: 'screen-puzzle-grid',
          },
        },
      }
    }

    default: {
      return modelSpace
    }
  }
})

updates.push((input) => {
  switch (input.msgSpace.t) {
    case 'screen-pack-builder.user-changed-slide': {
      if (!input.modelSpace.screenPackBuilder) {
        return input.modelSpace
      }
      return {
        ...input.modelSpace,
        screenPackBuilder: {
          ...input.modelSpace.screenPackBuilder,
          slideIndex: input.msgSpace.newSlideIndex,
        },
      }
    }
    default: {
      return input.modelSpace
    }
  }
})

updates.push(({ modelSpace, msgSpace, ctx }) => {
  switch (msgSpace.t) {
    case 'screen-pack-builder.got-flow-play-msg': {
      if (!modelSpace.screenPackBuilder) {
        return modelSpace
      }

      if (modelSpace.screenPackBuilder.screen.t !== 'screen-puzzle') {
        return modelSpace
      }

      const screen = modelSpace.screenPackBuilder.screen

      if (!screen.play) {
        return modelSpace
      }

      const updatedPlay =
        screen.puzzleResult.t === 'got'
          ? PlayMode.update({
              ctx: PlayMode.initCtx({
                flow: screen.puzzleResult.c.flow,
                solutions: ctx.solutions,
              }),
              model: screen.play,
              msg: msgSpace.c,
            })
          : { model: screen.play }

      return {
        ...modelSpace,
        screenPackBuilder: {
          ...modelSpace.screenPackBuilder,
          screen: {
            opened: null,
            t: 'screen-puzzle',
            puzzleIndex: modelSpace.screenPackBuilder.screen.puzzleIndex,
            puzzleResult: modelSpace.screenPackBuilder.screen.puzzleResult,
            play: updatedPlay.model,
          },
        },
      }
    }
    default: {
      return modelSpace
    }
  }
})

updates.push(({ modelSpace, msgSpace, ctx }) => {
  if (modelSpace.screenPackBuilder?.screen.t !== 'screen-puzzle') {
    return modelSpace
  }

  switch (msgSpace.t) {
    case 'screen-pack-builder.puzzle-screen.user-clicked-next-puzzle': {
      const doesPackIncludePuzzle =
        msgSpace.nextPuzzleResult.t === 'got'
          ? modelSpace.screenPackBuilder.pack.puzzleIds.includes(msgSpace.nextPuzzleResult.c.id)
          : false

      if (!doesPackIncludePuzzle) {
        return modelSpace
      }

      return {
        ...modelSpace,
        screenPackBuilder: {
          ...modelSpace.screenPackBuilder,
          screen: {
            t: 'screen-puzzle',
            opened: null,
            puzzleIndex: clamp(
              modelSpace.screenPackBuilder.screen.puzzleIndex + 1,
              0,
              modelSpace.screenPackBuilder.pack.puzzleIds.length - 1,
            ),
            play:
              msgSpace.nextPuzzleResult.t === 'got'
                ? PlayMode.init({
                    ctx: PlayMode.initCtx({
                      flow: msgSpace.nextPuzzleResult.c.flow,
                      solutions: ctx.solutions,
                    }),
                  })
                : modelSpace.screenPackBuilder.screen.play,
            puzzleResult: msgSpace.nextPuzzleResult,
          },
        },
      }
    }

    default: {
      return modelSpace
    }
  }
})

updates.push(({ modelSpace, msgSpace, ctx }) => {
  if (modelSpace.screenPackBuilder?.screen.t !== 'screen-puzzle') {
    return modelSpace
  }

  switch (msgSpace.t) {
    case 'screen-pack-builder.puzzle-screen.user-clicked-previous-puzzle-button': {
      const doesPackIncludePuzzle =
        msgSpace.previousPuzzleResult.t === 'got'
          ? modelSpace.screenPackBuilder.pack.puzzleIds.includes(msgSpace.previousPuzzleResult.c.id)
          : false
      if (!doesPackIncludePuzzle) {
        return modelSpace
      }
      return {
        ...modelSpace,
        screenPackBuilder: {
          ...modelSpace.screenPackBuilder,
          screen: {
            t: 'screen-puzzle',
            opened: null,
            puzzleIndex: clamp(
              modelSpace.screenPackBuilder.screen.puzzleIndex - 1,
              0,
              modelSpace.screenPackBuilder.pack.puzzleIds.length - 1,
            ),
            play:
              msgSpace.previousPuzzleResult.t === 'got'
                ? PlayMode.init({
                    ctx: PlayMode.initCtx({
                      flow: msgSpace.previousPuzzleResult.c.flow,
                      solutions: ctx.solutions,
                    }),
                  })
                : modelSpace.screenPackBuilder.screen.play,
            puzzleResult: msgSpace.previousPuzzleResult,
          },
        },
      }
    }
    default: {
      return modelSpace
    }
  }
})

updates.push(({ modelSpace, msgSpace }) => {
  switch (msgSpace.t) {
    case 'screen-pack-builder.puzzle-screen.user-clicked-more-button': {
      if (!modelSpace.screenPackBuilder) {
        return modelSpace
      }
      return {
        ...modelSpace,
        screenPackBuilder: {
          ...modelSpace.screenPackBuilder,
          screen: {
            ...modelSpace.screenPackBuilder.screen,
            opened: 'more',
          },
        },
      }
    }
    case 'screen-pack-builder.puzzle-screen.user-closed-more-drawer': {
      if (!modelSpace.screenPackBuilder) {
        return modelSpace
      }
      return {
        ...modelSpace,
        screenPackBuilder: {
          ...modelSpace.screenPackBuilder,
          screen: {
            ...modelSpace.screenPackBuilder.screen,
            opened: null,
          },
        },
      }
    }
    default: {
      return modelSpace
    }
  }
})

const clamp = (value: number, min: number, max: number): number => {
  return Math.max(min, Math.min(max, value))
}

updates.push(({ modelSpace, msgSpace }) => {
  switch (msgSpace.t) {
    case 'remove-puzzle-from-pack.user-clicked-remove-from-pack-button': {
      if (!modelSpace.screenPackBuilder) {
        return modelSpace
      }

      const pack = modelSpace.screenPackBuilder.pack

      const packNew = Pack.remove(pack, msgSpace.puzzleIndex)

      return {
        ...modelSpace,
        screenPackBuilder: {
          ...modelSpace.screenPackBuilder,
          pack: packNew,
          screen: {
            t: 'screen-puzzle-grid',
          },
        },
      }
    }
    default: {
      return modelSpace
    }
  }
})

updates.push((input) => {
  if (!input.modelSpace.screenPackBuilder) {
    return input.modelSpace
  }

  return {
    ...input.modelSpace,
    screenPackBuilder: {
      ...input.modelSpace.screenPackBuilder,
      slideIndex: PackPuzzleGridUI.clampSlideIndex(
        input.modelSpace.screenPackBuilder.slideIndex,
        input.modelSpace.screenPackBuilder.pack.puzzleIds.length,
      ),
    },
  }
})

const toSlideIndex = (modelSpace?: ModelSpace | null | undefined): number => {
  return modelSpace?.slideIndex ?? 0
}

export const ScreenPackBuilderSpace = {
  toSlideIndex,
  init,
  update,
}
