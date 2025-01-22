import { Pack } from '../../@/pack/pack'
import { PackPuzzleGridUI } from '../../@/pack/pack-puzzle-grid-ui'
import { ModePlay } from '../../@/mode-play'
import { EditPackNameSpace } from './drawer-edit-pack-name/space'
import { ScreenAddPuzzleSpace } from './screen-add-puzzle/space'
import type { ModelSpace, UpdateSpace } from './types'

const initSpace = ({ pack }: { pack: Pack }): ModelSpace => {
  return {
    ...ScreenAddPuzzleSpace.initSpace(),
    editPackName: EditPackNameSpace.init({ pack }),
    pack,
    slideIndex: 0,
    screen: {
      t: 'screen-puzzle-grid',
    },
  }
}

const updates: UpdateSpace[] = []

const updateSpace: UpdateSpace = (input) => {
  const { ctx, msgSpace, modelSpace } = input
  return updates.reduce((modelSpace, updateSpace) => updateSpace({ ctx, msgSpace, modelSpace }), modelSpace)
}

updates.push(ScreenAddPuzzleSpace.updateSpace)

updates.push((input) => {
  switch (input.msgSpace.t) {
    case 'screen-pack-builder.user-clicked-back-button': {
      return {
        ...input.modelSpace,
        msgs: [
          {
            t: 'exit-pack-builder',
          },
        ],
      }
    }
    default: {
      return input.modelSpace
    }
  }
})

updates.push(({ modelSpace, msgSpace }) => {
  switch (msgSpace.t) {
    case 'screen-pack-builder.user-clicked-open-add-puzzle-screen-button': {
      return {
        ...modelSpace,
        screen: {
          t: 'screen-add-puzzle',
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
      const puzzleId = modelSpace.pack.puzzleIds[msgSpace.puzzleIndex]

      if (msgSpace.puzzleResult.t === 'got' && msgSpace.puzzleResult.c.id !== puzzleId) {
        return modelSpace
      }

      return {
        ...modelSpace,
        screen: {
          opened: null,
          t: 'screen-puzzle',
          puzzleIndex: msgSpace.puzzleIndex,
          puzzleResult: msgSpace.puzzleResult,
          play:
            msgSpace.puzzleResult.t === 'got'
              ? ModePlay.init({
                  ctx: ModePlay.initCtx({
                    flow: msgSpace.puzzleResult.c.flow,
                    solutions: ctx.solutions,
                  }),
                })
              : null,
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
    case 'screen-pack-builder.puzzle-screen.user-clicked-exit-play-puzzle-screen': {
      const puzzleIndex = modelSpace.screen.t === 'screen-puzzle' ? modelSpace.screen.puzzleIndex : null

      if (puzzleIndex === null) {
        return modelSpace
      }

      const slideIndex = PackPuzzleGridUI.toSlideIndex(puzzleIndex)

      return {
        ...modelSpace,
        slideIndex: slideIndex,
        screen: {
          t: 'screen-puzzle-grid',
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
      if (!input.modelSpace) {
        return input.modelSpace
      }
      return {
        ...input.modelSpace,
        slideIndex: input.msgSpace.newSlideIndex,
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
      if (!modelSpace) {
        return modelSpace
      }

      if (modelSpace.screen.t !== 'screen-puzzle') {
        return modelSpace
      }

      const screen = modelSpace.screen

      if (!screen.play) {
        return modelSpace
      }

      const updatedPlay =
        screen.puzzleResult.t === 'got'
          ? ModePlay.update({
              ctx: ModePlay.initCtx({
                flow: screen.puzzleResult.c.flow,
                solutions: ctx.solutions,
              }),
              model: screen.play,
              msg: msgSpace.c,
            })
          : { model: screen.play }

      return {
        ...modelSpace,
        screen: {
          opened: null,
          t: 'screen-puzzle',
          puzzleIndex: modelSpace.screen.puzzleIndex,
          puzzleResult: modelSpace.screen.puzzleResult,
          play: updatedPlay.model,
        },
      }
    }
    default: {
      return modelSpace
    }
  }
})

updates.push(({ modelSpace, msgSpace, ctx }) => {
  if (modelSpace?.screen.t !== 'screen-puzzle') {
    return modelSpace
  }

  switch (msgSpace.t) {
    case 'screen-pack-builder.puzzle-screen.user-clicked-next-puzzle': {
      const doesPackIncludePuzzle =
        msgSpace.nextPuzzleResult.t === 'got'
          ? modelSpace.pack.puzzleIds.includes(msgSpace.nextPuzzleResult.c.id)
          : false

      if (!doesPackIncludePuzzle) {
        return modelSpace
      }

      return {
        ...modelSpace,
        screen: {
          t: 'screen-puzzle',
          opened: null,
          puzzleIndex: clamp(modelSpace.screen.puzzleIndex + 1, 0, modelSpace.pack.puzzleIds.length - 1),
          play:
            msgSpace.nextPuzzleResult.t === 'got'
              ? ModePlay.init({
                  ctx: ModePlay.initCtx({
                    flow: msgSpace.nextPuzzleResult.c.flow,
                    solutions: ctx.solutions,
                  }),
                })
              : modelSpace.screen.play,
          puzzleResult: msgSpace.nextPuzzleResult,
        },
      }
    }

    default: {
      return modelSpace
    }
  }
})

updates.push(({ modelSpace, msgSpace, ctx }) => {
  if (modelSpace?.screen.t !== 'screen-puzzle') {
    return modelSpace
  }

  switch (msgSpace.t) {
    case 'screen-pack-builder.puzzle-screen.user-clicked-previous-puzzle-button': {
      const doesPackIncludePuzzle =
        msgSpace.previousPuzzleResult.t === 'got'
          ? modelSpace.pack.puzzleIds.includes(msgSpace.previousPuzzleResult.c.id)
          : false
      if (!doesPackIncludePuzzle) {
        return modelSpace
      }
      return {
        ...modelSpace,
        screen: {
          t: 'screen-puzzle',
          opened: null,
          puzzleIndex: clamp(modelSpace.screen.puzzleIndex - 1, 0, modelSpace.pack.puzzleIds.length - 1),
          play:
            msgSpace.previousPuzzleResult.t === 'got'
              ? ModePlay.init({
                  ctx: ModePlay.initCtx({
                    flow: msgSpace.previousPuzzleResult.c.flow,
                    solutions: ctx.solutions,
                  }),
                })
              : modelSpace.screen.play,
          puzzleResult: msgSpace.previousPuzzleResult,
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
      if (!modelSpace) {
        return modelSpace
      }
      return {
        ...modelSpace,
        screen: {
          ...modelSpace.screen,
          opened: 'more',
        },
      }
    }
    case 'screen-pack-builder.puzzle-screen.user-closed-more-drawer': {
      if (!modelSpace) {
        return modelSpace
      }
      return {
        ...modelSpace,
        screen: {
          ...modelSpace.screen,
          opened: null,
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
      if (!modelSpace) {
        return modelSpace
      }

      const pack = modelSpace.pack

      const packNew = Pack.remove(pack, msgSpace.puzzleIndex)

      return {
        ...modelSpace,
        pack: packNew,
        screen: {
          t: 'screen-puzzle-grid',
        },
      }
    }
    default: {
      return modelSpace
    }
  }
})

updates.push((input) => {
  if (!input.modelSpace) {
    return input.modelSpace
  }

  return {
    ...input.modelSpace,
    slideIndex: PackPuzzleGridUI.clampSlideIndex(input.modelSpace.slideIndex, input.modelSpace.pack.puzzleIds.length),
  }
})

const toSlideIndex = (modelSpace?: ModelSpace | null | undefined): number => {
  return modelSpace?.slideIndex ?? 0
}

export const ScreenPackBuilderSpace = {
  toSlideIndex,
  initSpace,
  updateSpace,
}
