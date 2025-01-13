import type { UpdateSpace } from '../types'

const update: UpdateSpace = (input) => {
  switch (input.msgSpace.t) {
    case 'flow.builder.screen-main-menu.user-clicked-option': {
      switch (input.msgSpace.option) {
        case 'pack-builder': {
          return {
            ...input.modelSpace,
            screen: {
              t: 'screen-pack-builder-open',
            },
          }
        }

        case 'puzzle-builder': {
          return {
            ...input.modelSpace,
            screen: {
              t: 'screen-puzzle-builder-open',
            },
          }
        }
      }
    }

    case 'screen-main-menu.user-clicked-back-button': {
      return {
        ...input.modelSpace,
        event: {
          t: 'user-clicked-exit-mode-button',
          userId: input.msgSpace.userId,
        },
      }
    }

    default: {
      return input.modelSpace
    }
  }
}

export const ScreenMainMenuSpace = {
  update,
}
