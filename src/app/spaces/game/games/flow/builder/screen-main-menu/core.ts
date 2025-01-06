import type { UpdateCore } from '../types'

const update: UpdateCore = (input) => {
  switch (input.msgCore.t) {
    case 'flow.builder.screen-main-menu.user-clicked-option': {
      switch (input.msgCore.option) {
        case 'pack-builder': {
          return {
            ...input.modelCore,
            screen: {
              t: 'screen-pack-builder-open',
            },
          }
        }

        case 'puzzle-builder': {
          return {
            ...input.modelCore,
            screen: {
              t: 'screen-puzzle-builder-open',
            },
          }
        }
      }
    }

    case 'screen-main-menu.user-clicked-back-button': {
      return {
        ...input.modelCore,
        event: {
          t: 'user-clicked-exit-mode-button',
          userId: input.msgCore.userId,
        },
      }
    }

    default: {
      return input.modelCore
    }
  }
}

export const ScreenMainMenuCore = {
  update,
}
