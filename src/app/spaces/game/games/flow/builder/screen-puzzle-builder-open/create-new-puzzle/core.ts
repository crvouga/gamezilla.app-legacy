import { isErr } from '~/@/result'
import type { UpdateCore } from '../../types'
import { Edit } from '../../../@/edit'
import { Play } from '../../../@/play'

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
          edit: Edit.init({
            flow: flowPuzzleNew.flow,
          }),
          play: Play.init({
            ctx: Play.initCtx({
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
