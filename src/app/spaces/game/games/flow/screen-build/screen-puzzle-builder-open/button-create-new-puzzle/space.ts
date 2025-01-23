import { isErr } from '~/@/result'
import type { UpdateSpace } from '../../types'
import { ModeEdit } from '../../../@/mode-edit'
import { ModePlay } from '../../../@/mode-play'

const updateSpace: UpdateSpace = ({ modelSpace, msgSpace }) => {
  switch (msgSpace.t) {
    case 'create-new-puzzle.user-created-puzzle': {
      if (isErr(msgSpace.created)) {
        return modelSpace
      }
      const puzzleNew = msgSpace.created.value
      return {
        ...modelSpace,
        screen: {
          t: 'screen-puzzle-builder',
        },
        screenPackBuilder: modelSpace.screenPackBuilder,
        screenPuzzleBuilder: {
          t: 'puzzle-builder',
          mode: { t: 'edit' },
          ModeEdit: ModeEdit.init({ flow: puzzleNew.flow }),
          ModePlay: ModePlay.init({ ctx: ModePlay.initCtx({ flow: puzzleNew.flow }) }),
          puzzle: puzzleNew,
        },
      }
    }

    default: {
      return modelSpace
    }
  }
}

export const CreateNewPuzzleSpace = { updateSpace }
