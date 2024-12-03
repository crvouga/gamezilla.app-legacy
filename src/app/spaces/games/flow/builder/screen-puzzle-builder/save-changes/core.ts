import { isErr } from '~/@/core'
import type { UpdateCore } from '../../types'

const updateCore: UpdateCore = ({ modelCore, msgCore }) => {
  switch (msgCore.t) {
    case 'screen-puzzle-builder.saved-puzzle': {
      if (isErr(msgCore.saved)) {
        return modelCore
      }

      if (!modelCore.screenPuzzleBuilder) {
        return modelCore
      }

      return {
        ...modelCore,
        screen: modelCore.screen,
        screenPackBuilder: modelCore.screenPackBuilder,
        screenPuzzleBuilder: {
          ...modelCore.screenPuzzleBuilder,
          puzzle: msgCore.saved.value
        }
      }
    }

    default: {
      return modelCore
    }
  }
}

export const SaveChangesCore = {
  updateCore
}
