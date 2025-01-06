import type { SpaceCtx } from '~/app/spaces/@/space/ctx'
import type { Puzzle } from '../../../@/puzzle/puzzle'
import { PuzzleName } from '../../../@/puzzle/puzzle-name'
import type { ModelCore, MsgCore } from '../../types'

const updateCore = ({ modelCore, msgCore }: { ctx: SpaceCtx; msgCore: MsgCore; modelCore: ModelCore }): ModelCore => {
  switch (msgCore.t) {
    case 'user-edited-puzzle-name': {
      const puzzleBuilder = modelCore.screenPuzzleBuilder
      if (!puzzleBuilder) {
        return modelCore
      }

      if (msgCore.flowPuzzleId !== puzzleBuilder.puzzle.id) {
        return modelCore
      }
      if (msgCore.edited.t === 'err') {
        return modelCore
      }
      if (!PuzzleName.is(msgCore.newName)) {
        return modelCore
      }
      const puzzleNew: Puzzle = {
        ...puzzleBuilder.puzzle,
        name: msgCore.newName,
      }
      return {
        ...modelCore,
        screenPuzzleBuilder: {
          ...puzzleBuilder,
          puzzle: puzzleNew,
        },
      }
    }

    default: {
      return modelCore
    }
  }
}

export const EditPuzzleNameCore = {
  updateCore,
}
