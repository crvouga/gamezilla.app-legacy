import type { SpaceCtx } from 'gamezilla-app/app/spaces/@/space'
import { ScreenMainMenuCore } from './screen-main-menu/core'
import { ScreenOpenPackCore } from './screen-open-pack/core'
import { ScreenOpenPuzzleCore } from './screen-open-puzzle/core'
import { ScreenPackBuilderCore } from './screen-pack-builder/core'
import { ScreenPuzzleBuilderCore } from './screen-puzzle-builder/core'
import type { ModelCore, UpdateCore } from './types'

const initCore = (_input: { ctx: SpaceCtx }): ModelCore => {
  return {
    ...ScreenMainMenuCore.initCore,
    screen: { t: 'screen-main-menu' },
    packBuilder: null,
    openPuzzle: null,
    puzzleBuilder: null,
    openPack: null
  }
}

const updates: UpdateCore[] = [
  ScreenPuzzleBuilderCore.updateCore,
  ScreenOpenPuzzleCore.updateCore,
  ScreenPackBuilderCore.update,
  ScreenOpenPackCore.update,
  ScreenMainMenuCore.updateCore
]

const updateCore: UpdateCore = (input) => {
  return updates.reduce(
    (acc, updateCore) =>
      updateCore({
        ...input,
        modelCore: acc
      }),
    input.modelCore
  )
}

export const BuilderCore = {
  initCore,
  updateCore
}
