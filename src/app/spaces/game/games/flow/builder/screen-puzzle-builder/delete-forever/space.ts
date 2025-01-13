import type { UpdateSpace } from '../../types'

const updateSpace: UpdateSpace = ({ modelSpace, msgSpace }) => {
  switch (msgSpace.t) {
    case 'user-deleted-puzzle': {
      return {
        ...modelSpace,
        screenPuzzleBuilder: null,
        screen: {
          t: 'screen-main-menu',
        },
        option: 'puzzles',
      }
    }
    default: {
      return modelSpace
    }
  }
}

export const DeleteForeverSpace = {
  updateSpace,
}
