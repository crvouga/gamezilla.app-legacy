import type { SpaceModule } from './types'
import { ScreenPlayPuzzleSpace } from './screen-play-puzzle/space'

const initSpace: SpaceModule['initSpace'] = () => {
  return {
    screen: {
      t: 'screen-select-pack',
    },
  }
}

const update: SpaceModule['updateSpace'] = ({ modelSpace, msgSpace, ctx }) => {
  switch (msgSpace.t) {
    case 'user-clicked-exit-play-mode-button': {
      return {
        ...modelSpace,
        event: {
          t: 'user-clicked-exit-mode-button',
          userId: msgSpace.userId,
        },
      }
    }

    case 'user-clicked-open-pack-puzzle-grid-item': {
      return {
        ...modelSpace,
        screen: {
          t: 'screen-select-puzzle',
          pack: msgSpace.pack,
          slideIndex: 0,
        },
      }
    }
    case 'user-clicked-exit-screen-open-pack': {
      return {
        ...modelSpace,
        screen: {
          t: 'screen-select-pack',
        },
      }
    }
    case 'user-clicked-open-screen-play-puzzle': {
      switch (modelSpace.screen.t) {
        case 'screen-select-puzzle': {
          return {
            ...modelSpace,
            screen: ScreenPlayPuzzleSpace.initSpace({
              flowPack: modelSpace.screen.pack,
              puzzleIndex: msgSpace.puzzleIndex,
              flowPuzzle: msgSpace.flowPuzzle,
              ctx,
            }),
          }
        }
        default: {
          return modelSpace
        }
      }
    }

    case 'user-changed-slides': {
      switch (modelSpace.screen.t) {
        case 'screen-select-puzzle': {
          return {
            ...modelSpace,
            screen: {
              ...modelSpace.screen,
              slideIndex: msgSpace.slideIndex,
            },
          }
        }
        default: {
          return modelSpace
        }
      }
    }

    default: {
      return modelSpace
    }
  }
}

const updates = [update, ScreenPlayPuzzleSpace.updateSpace]
const updateSpace: SpaceModule['updateSpace'] = (input) => {
  return updates.reduce((modelSpace, update) => update({ ...input, modelSpace }), input.modelSpace)
}

export const PlaySpace = {
  initSpace,
  updateSpace,
}
