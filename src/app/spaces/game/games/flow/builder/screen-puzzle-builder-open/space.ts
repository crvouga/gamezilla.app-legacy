import { EditMode } from '../../@/edit-mode'
import { PlayMode } from '../../@/play-mode'
import type { UpdateSpace } from '../types'
import { CreateNewPuzzleSpace } from './create-new-puzzle/space'

const updateSpaceMain: UpdateSpace = ({ modelSpace, msgSpace, ctx }) => {
  switch (msgSpace.t) {
    case 'screen-puzzle-builder-open.clicked-puzzle-list-item': {
      return {
        ...modelSpace,
        option: 'puzzles',
        screenPackBuilder: modelSpace.screenPackBuilder,
        screen: {
          t: 'screen-puzzle-builder',
        },
        screenPuzzleBuilder: {
          t: 'puzzle-builder',
          editMode: EditMode.init({
            flow: msgSpace.puzzle.flow,
          }),
          playMode: PlayMode.init({ ctx: PlayMode.initCtx({ flow: msgSpace.puzzle.flow, solutions: ctx.solutions }) }),
          mode: { t: 'edit' },
          puzzle: msgSpace.puzzle,
        },
      }
    }

    default: {
      return modelSpace
    }
  }
}

const updateSpace: UpdateSpace = (input) => {
  return [CreateNewPuzzleSpace.updateSpace, updateSpaceMain].reduce(
    (acc, updateSpace) => updateSpace({ ...input, modelSpace: acc }),
    input.modelSpace,
  )
}

export const ScreenPuzzleBuilderOpenSpace = { updateSpace }
