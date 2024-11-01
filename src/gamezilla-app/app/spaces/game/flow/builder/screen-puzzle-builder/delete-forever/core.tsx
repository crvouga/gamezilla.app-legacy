import type { UpdateCore } from '../../types'

const updateCore: UpdateCore = ({ modelCore, msgCore }) => {
  switch (msgCore.t) {
    case 'user-deleted-puzzle': {
      return {
        ...modelCore,
        puzzleBuilder: null,
        screen: {
          t: 'screen-main-menu'
        },
        option: 'puzzles'
      }
    }
    default: {
      return modelCore
    }
  }
}

export const DeleteForeverCore = {
  updateCore
}
