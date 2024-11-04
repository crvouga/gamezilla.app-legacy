import { isErr } from 'gamezilla-app/@/core'
import type { UpdateCore } from '../../types'
import { FlowEdit } from '../../../@/flow/flow-edit'
import { FlowPlay } from '../../../@/flow/flow-play'

const updateCore: UpdateCore = ({ modelCore, msgCore }) => {
  switch (msgCore.t) {
    case 'create-new-puzzle.user-created-puzzle': {
      if (isErr(msgCore.created)) {
        return modelCore
      }
      const flowPuzzleNew = msgCore.created.value
      return {
        ...modelCore,
        screen: {
          t: 'screen-puzzle-builder'
        },
        screenPackBuilder: modelCore.screenPackBuilder,
        screenPuzzleBuilder: {
          t: 'puzzle-builder',
          mode: {
            t: 'edit'
          },
          edit: FlowEdit.init({
            flow: flowPuzzleNew.flow
          }),
          play: FlowPlay.init({
            ctx: FlowPlay.initCtx({
              flowPuzzle: flowPuzzleNew
            })
          }),
          puzzle: flowPuzzleNew
        }
      }
    }

    default: {
      return modelCore
    }
  }
}

export const CreateNewPuzzleCore = { updateCore }
