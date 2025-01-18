import type { UpdateSpace } from '../../types'

const updateSpace: UpdateSpace = (input) => {
  switch (input.msgSpace.t) {
    case 'user-deleted-puzzle': {
      return {
        ...input.modelSpace,
        screenPuzzleBuilder: null,
        screen: {
          t: 'screen-puzzle-builder-open',
        },
        option: 'puzzles',
      }
    }
    default: {
      return input.modelSpace
    }
  }
}

export const DeleteForeverSpace = {
  updateSpace,
}
