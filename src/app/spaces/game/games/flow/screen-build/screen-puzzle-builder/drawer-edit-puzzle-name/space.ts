import type { SpaceCtx } from '~/app/spaces/@/space/ctx'
import type { Puzzle } from '../../../@/puzzle/puzzle'
import { PuzzleName } from '../../../@/puzzle/puzzle-name'
import type { ModelSpace, MsgSpace } from '../../types'

const updateSpace = ({
  modelSpace,
  msgSpace,
}: {
  ctx: SpaceCtx
  msgSpace: MsgSpace
  modelSpace: ModelSpace
}): ModelSpace => {
  switch (msgSpace.t) {
    case 'user-edited-puzzle-name': {
      const puzzleBuilder = modelSpace.screenPuzzleBuilder
      if (!puzzleBuilder) {
        return modelSpace
      }

      if (msgSpace.flowPuzzleId !== puzzleBuilder.puzzle.id) {
        return modelSpace
      }
      if (msgSpace.edited.t === 'err') {
        return modelSpace
      }
      if (!PuzzleName.is(msgSpace.newName)) {
        return modelSpace
      }
      const puzzleNew: Puzzle = {
        ...puzzleBuilder.puzzle,
        name: msgSpace.newName,
      }
      return {
        ...modelSpace,
        screenPuzzleBuilder: {
          ...puzzleBuilder,
          puzzle: puzzleNew,
        },
      }
    }

    default: {
      return modelSpace
    }
  }
}

export const EditPuzzleNameSpace = {
  updateSpace,
}
