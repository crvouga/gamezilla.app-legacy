import type { SpaceCtx } from 'gamezilla-app/app/spaces/@/space'
import type { ModelCore, UpdateCore } from './types'
import { ListTabsCore } from './list-tabs/core'
import { ScreenOpenPackCore } from './screen-open-pack/core'
import { ScreenPackBuilderCore } from './screen-pack-builder/core'
import { ScreenOpenPuzzleCore } from './screen-open-puzzle/core'
import { ScreenPuzzleBuilderCore } from './screen-puzzle-builder/core'

const initCore = (_input: { ctx: SpaceCtx }): ModelCore => {
  return {
    ...ListTabsCore.initCore,
    opened: { t: 'list' },
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
  ListTabsCore.updateCore
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
