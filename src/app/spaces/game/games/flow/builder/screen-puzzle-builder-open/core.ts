import { Edit } from '../../@/edit'
import { Play } from '../../@/play'
import type { UpdateCore } from '../types'
import { CreateNewPuzzleCore } from './create-new-puzzle/core'

const updateCoreMain: UpdateCore = ({ modelCore, msgCore, ctx }) => {
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
          editMode: Edit.init({
            flow: msgCore.puzzle.flow,
          }),
          playMode: Play.init({ ctx: Play.initCtx({ flow: msgCore.puzzle.flow, solutions: ctx.solutions }) }),
          mode: { t: 'edit' },
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
