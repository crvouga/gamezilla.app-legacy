import { isErr } from '~/@/result'
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

const updates: UpdateSpace[] = [
  ScreenPuzzleBuilderSpace.updateSpace,
  ScreenPuzzleBuilderOpenSpace.updateSpace,

  ScreenPackBuilderOpenSpace.update,
  ScreenMainMenuSpace.update,
]

const updateSpace: UpdateSpace = (input) => {
  return updates.reduce((acc, update) => update({ ...input, modelSpace: acc }), input.modelSpace)
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

updates.push((input) => {
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
})

updates.push(({ modelSpace, msgSpace }) => {
  switch (msgSpace.t) {
    case 'create-new-pack.user-created-pack': {
      if (isErr(msgSpace.created)) {
        return modelSpace
      }

      const modelSpaceNew: ModelSpace = {
        ...modelSpace,
        screen: {
          t: 'screen-pack-builder',
        },
        screenPackBuilder: ScreenPackBuilderSpace.initSpace({
          pack: msgSpace.created.value,
        }),
      }

      return modelSpaceNew
    }
    default: {
      return modelSpace
    }
  }
})

updates.push((input) => {
  switch (input.msgSpace.t) {
    case 'got-screen-pack-builder-msg': {
      if (!input.modelSpace.screenPackBuilder) {
        return input.modelSpace
      }
      const updated = ScreenPackBuilderSpace.updateSpace({
        ctx: input.ctx,
        modelSpace: input.modelSpace.screenPackBuilder,
        msgSpace: input.msgSpace.c,
      })
      const modelNew: ModelSpace = {
        ...input.modelSpace,
        screenPackBuilder: updated,
      }

      const msg = updated.msgs?.[0]

      switch (msg?.t) {
        case 'exit-pack-builder': {
          return {
            ...modelNew,
            screen: {
              t: 'screen-pack-builder-open',
            },
          }
        }
        default: {
          return modelNew
        }
      }
    }
    default: {
      return input.modelSpace
    }
  }
})

export const BuilderSpace = {
  initSpace,
  updateSpace,
}
