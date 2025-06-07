import { ModeEdit } from '../../../@/mode-edit'
import { ModePlay } from '../../../@/mode-play'
import type { UpdateSpace } from '../../types'
import { CreateNewPuzzleSpace } from './button-create-new-puzzle/space'

const updates: UpdateSpace[] = []

const updateSpace: UpdateSpace = (input) => {
  return updates.reduce((modelSpace, update) => update({ ...input, modelSpace }), input.modelSpace)
}

updates.push(CreateNewPuzzleSpace.updateSpace)

updates.push(({ modelSpace, msgSpace }) => {
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
          modeEdit: ModeEdit.init({
            flow: msgSpace.puzzle.flow,
          }),
          modePlay: ModePlay.init({
            ctx: ModePlay.initCtx({
              flow: msgSpace.puzzle.flow,
            }),
          }),
          mode: { t: 'edit' },
          puzzle: msgSpace.puzzle,
        },
      }
    }

    default: {
      return modelSpace
    }
  }
})

updates.push((input) => {
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
})

export const ScreenPuzzleBuilderOpenSpace = {
  updateSpace,
}
