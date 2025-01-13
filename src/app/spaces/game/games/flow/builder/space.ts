import { FlowSpaceCtx } from '../@/space/ctx'
import { ScreenMainMenuSpace } from './screen-main-menu/space'
import { ScreenPackBuilderOpenSpace } from './screen-pack-builder-open/space'
import { ScreenPackBuilderSpace } from './screen-pack-builder/space'
import { ScreenPuzzleBuilderOpenSpace } from './screen-puzzle-builder-open/space'
import { ScreenPuzzleBuilderSpace } from './screen-puzzle-builder/space'
import type { ModelSpace, Screen, UpdateSpace } from './types'

const initSpace = (_input: { ctx: FlowSpaceCtx }): ModelSpace => {
  return {
    screen: { t: 'screen-main-menu' },
    screenPackBuilder: null,
    screenPuzzleBuilderOpen: null,
    screenPuzzleBuilder: null,
    screenPackBuilderOpen: null,
  }
}

const toPreviousScreen = (screen: Screen): Screen => {
  switch (screen.t) {
    case 'screen-main-menu': {
      return {
        t: 'screen-main-menu',
      }
    }
    case 'screen-pack-builder': {
      return {
        t: 'screen-pack-builder-open',
      }
    }
    case 'screen-pack-builder-open': {
      return {
        t: 'screen-main-menu',
      }
    }
    case 'screen-puzzle-builder': {
      return {
        t: 'screen-puzzle-builder-open',
      }
    }
    case 'screen-puzzle-builder-open': {
      return {
        t: 'screen-main-menu',
      }
    }
  }
}

const updateBackButton: UpdateSpace = (input) => {
  switch (input.msgSpace.t) {
    case 'user-clicked-back-button': {
      return {
        ...input.modelSpace,
        screen: toPreviousScreen(input.modelSpace.screen),
      }
    }
    default: {
      return input.modelSpace
    }
  }
}

const updates: UpdateSpace[] = [
  ScreenPuzzleBuilderSpace.updateSpace,
  ScreenPuzzleBuilderOpenSpace.updateSpace,
  ScreenPackBuilderSpace.update,
  ScreenPackBuilderOpenSpace.update,
  ScreenMainMenuSpace.update,
  updateBackButton,
]

const updateSpace: UpdateSpace = (input) => {
  return updates.reduce((acc, update) => update({ ...input, modelSpace: acc }), input.modelSpace)
}

export const BuilderSpace = {
  initSpace,
  updateSpace,
}
