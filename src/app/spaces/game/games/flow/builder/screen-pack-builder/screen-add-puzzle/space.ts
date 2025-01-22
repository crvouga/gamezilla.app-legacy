import { Pack } from '../../../@/pack/pack'
import { UpdateSpace } from '../types'
import { ModelSpace } from './types'

const initSpace = (): ModelSpace => {
  return {
    screenAddPuzzle_puzzleDbQuery: null,
    screenAddPuzzle_selected: [],
  }
}

const updates: UpdateSpace[] = []

const updateSpace: UpdateSpace = (input) => {
  return updates.reduce((acc, update) => update({ ...input, modelSpace: acc }), input.modelSpace)
}

updates.push((input) => {
  switch (input.msgSpace?.t) {
    case 'screen-pack-builder.screen-add-puzzle.puzzle-db-query-query-changed': {
      return {
        ...input.modelSpace,
        screenAddPuzzle_puzzleDbQuery: input.msgSpace.query,
      }
    }
    default: {
      return input.modelSpace
    }
  }
})

updates.push((input) => {
  switch (input.msgSpace?.t) {
    case 'screen-pack-builder.screen-add-puzzle.user-clicked-puzzle-list-item': {
      return {
        ...input.modelSpace,
        screenAddPuzzle_selected: [...input.modelSpace.screenAddPuzzle_selected, input.msgSpace.puzzle.id],
      }
    }
    default: {
      return input.modelSpace
    }
  }
})

updates.push(({ modelSpace, msgSpace }) => {
  switch (msgSpace.t) {
    case 'screen-pack-builder.screen-add-puzzle.user-submitted-add-puzzles-form': {
      return {
        ...modelSpace,
        pack: Pack.add(modelSpace.pack, modelSpace.screenAddPuzzle_selected),
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
  updateSpace,
  initSpace,
}
