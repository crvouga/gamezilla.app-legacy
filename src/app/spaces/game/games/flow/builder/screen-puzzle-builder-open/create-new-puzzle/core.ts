import { isErr } from '~/@/result'
import type { UpdateCore } from '../../types'
import { EditMode } from '../../../@/edit-mode'
import { PlayMode } from '../../../@/play-mode'

const updateCore: UpdateCore = ({ modelCore, msgCore, ctx }) => {
  switch (msgCore.t) {
    case 'create-new-puzzle.user-created-puzzle': {
      if (isErr(msgCore.created)) {
        return modelCore
      }
      const flowPuzzleNew = msgCore.created.value
      return {
        ...modelCore,
        screen: {
          t: 'screen-puzzle-builder',
        },
        screenPackBuilder: modelCore.screenPackBuilder,
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
      return modelCore
    }
  }
}

export const CreateNewPuzzleCore = { updateCore }
