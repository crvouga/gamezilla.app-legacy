import type { SpaceCtx } from '~/app/spaces/@/space/ctx'
import { ScreenMainMenuCore } from './screen-main-menu/core'
import { ScreenPackBuilderOpenCore } from './screen-pack-builder-open/core'
import { ScreenPuzzleBuilderOpenCore } from './screen-puzzle-builder-open/core'
import { ScreenPackBuilderCore } from './screen-pack-builder/core'
import { ScreenPuzzleBuilderCore } from './screen-puzzle-builder/core'
import type { ModelCore, Screen, UpdateCore } from './types'

const init = (_input: { ctx: SpaceCtx }): ModelCore => {
  return {
    screen: { t: 'screen-main-menu' },
    screenPackBuilder: null,
    screenPuzzleBuilderOpen: null,
    screenPuzzleBuilder: null,
    screenPackBuilderOpen: null
  }
}

const toPreviousScreen = (screen: Screen): Screen => {
  switch (screen.t) {
    case 'screen-main-menu': {
      return {
        t: 'screen-main-menu'
      }
    }
    case 'screen-pack-builder': {
      return {
        t: 'screen-pack-builder-open'
      }
    }
    case 'screen-pack-builder-open': {
      return {
        t: 'screen-main-menu'
      }
    }
    case 'screen-puzzle-builder': {
      return {
        t: 'screen-puzzle-builder-open'
      }
    }
    case 'screen-puzzle-builder-open': {
      return {
        t: 'screen-main-menu'
      }
    }
  }
}

const updateBackButton: UpdateCore = (input) => {
  switch (input.msgCore.t) {
    case 'user-clicked-back-button': {
      return {
        ...input.modelCore,
        screen: toPreviousScreen(input.modelCore.screen)
      }
    }
    default: {
      return input.modelCore
    }
  }
}

const updates: UpdateCore[] = [
  ScreenPuzzleBuilderCore.updateCore,
  ScreenPuzzleBuilderOpenCore.updateCore,
  ScreenPackBuilderCore.update,
  ScreenPackBuilderOpenCore.update,
  ScreenMainMenuCore.update,
  updateBackButton
]

const update: UpdateCore = (input) => {
  return updates.reduce((acc, update) => update({ ...input, modelCore: acc }), input.modelCore)
}

export const BuilderCore = {
  init,
  update
}
