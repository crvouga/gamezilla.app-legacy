import { isErr } from 'gamezilla-app/@/core'
import type { UpdateCore } from '../../builder.types'

const updateCore: UpdateCore = ({ modelCore, msgCore }) => {
  switch (msgCore.t) {
    case 'screen-puzzle-builder.saved-puzzle': {
      if (isErr(msgCore.saved)) {
        return modelCore
      }

      if (!modelCore.puzzleBuilder) {
        return modelCore
      }

      return {
        ...modelCore,
        listTab: modelCore.listTab,
        opened: modelCore.opened,
        packBuilder: modelCore.packBuilder,
        puzzleBuilder: {
          ...modelCore.puzzleBuilder,
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
