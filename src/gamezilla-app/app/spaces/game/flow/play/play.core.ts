import type { CoreModule } from './play.types'
import { ScreenPlayPuzzleCore } from './screen-play-puzzle/screen-play-puzzle.core'

const initCore: CoreModule['initCore'] = () => {
  return {
    screen: {
      t: 'screen-select-pack'
    }
  }
}

const update: CoreModule['updateCore'] = ({ modelCore, msgCore }) => {
  switch (msgCore.t) {
    case 'user-clicked-exit-play-mode-button': {
      return {
        ...modelCore,
        event: {
          t: 'user-clicked-exit-mode-button',
          userId: msgCore.userId
        }
      }
    }

    case 'user-clicked-open-pack-list-item': {
      return {
        ...modelCore,
        screen: {
          t: 'screen-select-puzzle',
          flowPack: msgCore.pack,
          slideIndex: 0
        }
      }
    }
    case 'user-clicked-exit-pack-button': {
      return {
        ...modelCore,
        screen: {
          t: 'screen-select-pack'
        }
      }
    }
    case 'user-clicked-open-puzzle-grid-item': {
      switch (modelCore.screen.t) {
        case 'screen-select-puzzle': {
          return {
            ...modelCore,
            screen: ScreenPlayPuzzleCore.initCore({
              flowPack: modelCore.screen.flowPack,
              puzzleIndex: msgCore.puzzleIndex,
              flowPuzzle: msgCore.flowPuzzle
            })
          }
        }
        default: {
          return modelCore
        }
      }
    }

    case 'user-changed-slides': {
      switch (modelCore.screen.t) {
        case 'screen-select-puzzle': {
          return {
            ...modelCore,
            screen: {
              ...modelCore.screen,
              slideIndex: msgCore.slideIndex
            }
          }
        }
        default: {
          return modelCore
        }
      }
    }

    default: {
      return modelCore
    }
  }
}

const updates = [update, ScreenPlayPuzzleCore.updateCore]
const updateCore: CoreModule['updateCore'] = ({ modelCore, msgCore, ctx }) => {
  return updates.reduce(
    (acc, update) =>
      update({
        modelCore: acc,
        msgCore,
        ctx
      }),
    modelCore
  )
}

export const PlayCore = {
  initCore,
  updateCore
}
