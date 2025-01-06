import { FlowEdit } from '../../@/flow/edit'
import { FlowPlay } from '../../@/flow/play'
import type { UpdateCore } from '../types'
import { CreateNewPuzzleCore } from './create-new-puzzle/core'

const updateCoreMain: UpdateCore = ({ modelCore, msgCore }) => {
  switch (msgCore.t) {
    case 'screen-puzzle-builder-open.clicked-puzzle-list-item': {
      return {
        ...modelCore,
        option: 'puzzles',
        screenPackBuilder: modelCore.screenPackBuilder,
        screen: {
          t: 'screen-puzzle-builder',
        },
        screenPuzzleBuilder: {
          t: 'puzzle-builder',
          edit: FlowEdit.init({
            flow: msgCore.puzzle.flow,
          }),
          play: FlowPlay.init({
            ctx: FlowPlay.initCtx({
              flowPuzzle: msgCore.puzzle,
            }),
          }),
          mode: {
            t: 'edit',
          },
          puzzle: msgCore.puzzle,
        },
      }
    }

    default: {
      return modelCore
    }
  }
}

const updateCore: UpdateCore = (input) => {
  return [CreateNewPuzzleCore.updateCore, updateCoreMain].reduce(
    (acc, updateCore) => updateCore({ ...input, modelCore: acc }),
    input.modelCore,
  )
}

export const ScreenPuzzleBuilderOpenCore = { updateCore }
