import { Pack } from '../../../@/pack/pack'
import { UpdateSpace } from '../types'

const updates: UpdateSpace[] = []

const update: UpdateSpace = (input) => {
  return updates.reduce((acc, update) => update({ ...input, modelSpace: acc }), input.modelSpace)
}

updates.push((input) => {
  switch (input.msgSpace?.t) {
    case 'screen-pack-builder.screen-add-puzzle.puzzle-db-query-query-changed': {
      return {
        ...input.modelSpace,
        screenAddPuzzlePuzzleDbQuery: input.msgSpace.query,
      }
    }
    default: {
      return input.modelSpace
    }
  }
})

updates.push(({ modelSpace, msgSpace }) => {
  switch (msgSpace.t) {
    case 'screen-pack-builder.screen-add-puzzle.user-clicked-puzzle': {
      return {
        ...modelSpace,

        pack: Pack.add(modelSpace.pack, msgSpace.puzzle.id),
        screen: {
          t: 'screen-puzzle-grid',
          slideIndex: 0,
        },
        opened: {
          t: null,
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
    case 'screen-pack-builder.screen-add-puzzle.user-clicked-close': {
      return {
        ...modelSpace,
        opened: {
          t: null,
        },
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

export const ScreenAddPuzzleSpace = {
  update,
}
