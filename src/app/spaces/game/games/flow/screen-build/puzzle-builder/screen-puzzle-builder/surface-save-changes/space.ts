import { isErr } from '~/@/result'
import type { UpdateSpace } from '../../../types'

const updateSpace: UpdateSpace = (input) => {
  switch (input.msgSpace.t) {
    case 'screen-puzzle-builder.saved-puzzle': {
      if (isErr(input.msgSpace.saved)) {
        return input.modelSpace
      }

      if (!input.modelSpace.screenPuzzleBuilder) {
        return input.modelSpace
      }

      return {
        ...input.modelSpace,
        screen: input.modelSpace.screen,
        screenPackBuilder: input.modelSpace.screenPackBuilder,
        screenPuzzleBuilder: {
          ...input.modelSpace.screenPuzzleBuilder,
          puzzle: input.msgSpace.saved.value,
        },
      }
    }

    default: {
      return input.modelSpace
    }
  }
}

export const SaveChangesSpace = {
  updateSpace,
}
