import { isErr } from '~/@/result'
import type { UpdateSpace } from '../../types'
import { EditMode } from '../../../@/edit-mode'
import { PlayMode } from '../../../@/play-mode'

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
          editMode: EditMode.init({
            flow: flowPuzzleNew.flow,
          }),
          playMode: PlayMode.init({
            ctx: PlayMode.initCtx({
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
