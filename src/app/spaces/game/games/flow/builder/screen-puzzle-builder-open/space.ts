import { EditMode } from '../../@/edit-mode'
import { PlayMode } from '../../@/play-mode'
import type { UpdateSpace } from '../types'
import { CreateNewPuzzleSpace } from './create-new-puzzle/space'

const updateClickedPuzzleDbQueryItem: UpdateSpace = ({ modelSpace, msgSpace, ctx }) => {
  switch (msgSpace.t) {
    case 'screen-puzzle-builder-open.clicked-puzzle-db-query-item': {
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

const updateQueryChanged: UpdateSpace = (input) => {
  switch (input.msgSpace.t) {
    case 'screen-puzzle-builder-open.puzzle-db-query-query-changed': {
      return {
        ...input.modelSpace,
        screenPuzzleBuilderOpen: {
          query: input.msgSpace.query,
        },
      }
    }

    default: {
      return input.modelSpace
    }
  }
}

const updates = [CreateNewPuzzleSpace.updateSpace, updateClickedPuzzleDbQueryItem, updateQueryChanged]

const updateSpace: UpdateSpace = (input) => {
  return updates.reduce((modelSpace, update) => update({ ...input, modelSpace }), input.modelSpace)
}

export const ScreenPuzzleBuilderOpenSpace = { updateSpace }
