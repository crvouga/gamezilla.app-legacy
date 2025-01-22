import { isErr } from '~/@/result'
import type { UpdateSpace } from '../../types'
import { ModeEdit } from '../../../@/mode-edit'
import { ModePlay } from '../../../@/mode-play'

const updateSpace: UpdateSpace = ({ modelSpace, msgSpace, ctx }) => {
  switch (msgSpace.t) {
    case 'create-new-puzzle.user-created-puzzle': {
      if (isErr(msgSpace.created)) {
        return modelSpace
      }
      const flowPuzzleNew = msgSpace.created.value
      return {
        ...modelSpace,
        screen: {
          t: 'screen-puzzle-builder',
        },
        screenPackBuilder: modelSpace.screenPackBuilder,
        screenPuzzleBuilder: {
          t: 'puzzle-builder',
          mode: {
            t: 'edit',
          },
          ModeEdit: ModeEdit.init({
            flow: flowPuzzleNew.flow,
          }),
          ModePlay: ModePlay.init({
            ctx: ModePlay.initCtx({
              flow: flowPuzzleNew.flow,
              solutions: ctx.solutions,
            }),
          }),
          puzzle: flowPuzzleNew,
        },
      }
    }

    default: {
      return modelSpace
    }
  }
}

export const CreateNewPuzzleSpace = { updateSpace }
