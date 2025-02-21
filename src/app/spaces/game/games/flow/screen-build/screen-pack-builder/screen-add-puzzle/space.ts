import { Pack } from '../../../@/pack/pack'
import { PuzzleId } from '../../../@/puzzle/puzzle-id'
import { UpdateSpace } from '../types'
import { ModelSpace } from './types'

const initSpace = (): ModelSpace => {
  return {
    screenAddPuzzle_puzzleQuery: null,
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
        screenAddPuzzle_puzzleQuery: input.msgSpace.query,
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
        screenAddPuzzle_selected: togglePuzzleId(input.modelSpace.screenAddPuzzle_selected, input.msgSpace.puzzleId),
      }
    }
    default: {
      return input.modelSpace
    }
  }
})

updates.push((input) => {
  switch (input.msgSpace?.t) {
    case 'screen-pack-builder.screen-add-puzzle.user-clicked-header-checkbox': {
      const isAllSelected = input.modelSpace.screenAddPuzzle_selected.length === input.msgSpace.puzzleIds.length
      if (isAllSelected) {
        return {
          ...input.modelSpace,
          screenAddPuzzle_selected: [],
        }
      }
      return {
        ...input.modelSpace,
        screenAddPuzzle_selected: input.msgSpace.puzzleIds,
      }
    }
    default: {
      return input.modelSpace
    }
  }
})

const togglePuzzleId = (puzzleIds: PuzzleId[], puzzleId: PuzzleId) => {
  if (puzzleIds.includes(puzzleId)) {
    return puzzleIds.filter((id) => id !== puzzleId)
  }
  return [...puzzleIds, puzzleId]
}

updates.push(({ modelSpace, msgSpace }) => {
  switch (msgSpace.t) {
    case 'screen-pack-builder.screen-add-puzzle.user-submitted-add-puzzles-form': {
      return {
        ...modelSpace,
        pack: Pack.add(modelSpace.pack, modelSpace.screenAddPuzzle_selected),
        screenAddPuzzle_selected: [],
        screen: { t: 'screen-puzzle-grid', slideIndex: 0 },
        opened: null,
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
        opened: null,
        screenAddPuzzle_selected: [],
        screen: { t: 'screen-puzzle-grid' },
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
