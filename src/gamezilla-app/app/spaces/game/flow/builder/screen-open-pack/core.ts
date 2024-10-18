import type { UpdateCore } from '../types'
import { ScreenPackBuilderCore } from '../screen-pack-builder/core'
import { PackCreateNewCore } from './create-new-pack/core'

const updateCoreMain: UpdateCore = ({ modelCore, msgCore }) => {
  switch (msgCore.t) {
    case 'pack-list.user-clicked-pack-item': {
      return {
        ...modelCore,
        opened: {
          t: 'pack-builder'
        },
        packBuilder: ScreenPackBuilderCore.init({
          pack: msgCore.pack
        })
      }
    }

    default: {
      return modelCore
    }
  }
}

const updateCore: UpdateCore = (input) => {
  return [PackCreateNewCore.update, updateCoreMain].reduce(
    (modelCore, updateCore) =>
      updateCore({
        ...input,
        modelCore
      }),
    input.modelCore
  )
}

export const ScreenOpenPackCore = {
  update: updateCore
}
