import { FlowEdit } from '../../@/flow/flow-edit'
import { FlowPlay } from '../../@/flow/flow-play'
import type { UpdateCore } from '../types'
import { CreateNewPuzzleCore } from './create-new/core'

const updateCoreMain: UpdateCore = ({ modelCore, msgCore }) => {
  switch (msgCore.t) {
    case 'builder-open-puzzle.clicked-puzzle-list-item': {
      return {
        ...modelCore,
        option: 'puzzles',
        packBuilder: modelCore.packBuilder,
        screen: {
          t: 'screen-puzzle-builder'
        },
        puzzleBuilder: {
          t: 'puzzle-builder',
          edit: FlowEdit.init({
            flow: msgCore.puzzle.flow
          }),
          play: FlowPlay.init({
            ctx: {
              flowPuzzle: msgCore.puzzle
            }
          }),
          mode: {
            t: 'edit'
          },
          puzzle: msgCore.puzzle
        }
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
    input.modelCore
  )
}

export const ScreenOpenPuzzleCore = { updateCore }
