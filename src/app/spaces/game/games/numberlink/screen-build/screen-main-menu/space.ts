import type { UpdateSpace } from '../types'

const update: UpdateSpace = (input) => {
  switch (input.msgSpace.t) {
    case 'game.numberlink.build.screen-main-menu.user-clicked-option': {
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
          t: 'userClickedExitModeButton',
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
