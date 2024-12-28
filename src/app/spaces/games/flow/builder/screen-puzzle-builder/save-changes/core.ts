import { isErr } from '~/@/core'
import type { UpdateCore } from '../../types'

const updateCore: UpdateCore = (input) => {
  switch (input.msgCore.t) {
    case 'screen-puzzle-builder.saved-puzzle': {
      if (isErr(input.msgCore.saved)) {
        return input.modelCore
      }

      if (!input.modelCore.screenPuzzleBuilder) {
        return input.modelCore
      }

      return {
        ...input.modelCore,
        screen: input.modelCore.screen,
        screenPackBuilder: input.modelCore.screenPackBuilder,
        screenPuzzleBuilder: {
          ...input.modelCore.screenPuzzleBuilder,
          puzzle: input.msgCore.saved.value
        }
      }
    }

    default: {
      return input.modelCore
    }
  }
}

export const SaveChangesCore = {
  updateCore
}
