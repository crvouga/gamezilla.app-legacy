import { ModelSpace, MsgSpace } from './types'

const init = (): ModelSpace => {
  return {
    puzzleDbQuery: null,
  }
}

const update = (input: { msgSpace: MsgSpace; modelSpace: ModelSpace }): ModelSpace => {
  switch (input.msgSpace?.t) {
    case 'puzzle-db-query-query-changed': {
      return {
        ...input.modelSpace,
        puzzleDbQuery: input.msgSpace.query,
      }
    }
    default: {
      return input.modelSpace
    }
  }
}

export const ScreenAddPuzzleSpace = {
  update,
  init,
}
