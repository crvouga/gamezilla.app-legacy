import type { UpdateCore } from '../types'
import type { ModelCore } from './types'

const initCore: ModelCore = {
  listTab: 'puzzles'
}

const updateCore: UpdateCore = (input) => {
  switch (input.msgCore.t) {
    case 'user-changed-list-tab': {
      return {
        ...input.modelCore,
        listTab: input.msgCore.listTab
      }
    }

    case 'user-clicked-back-button': {
      return {
        ...input.modelCore,
        event: {
          t: 'user-clicked-exit-mode-button',
          userId: input.msgCore.userId
        }
      }
    }

    default: {
      return input.modelCore
    }
  }
}

export const ScreenMainMenuCore = {
  initCore,
  updateCore
}
