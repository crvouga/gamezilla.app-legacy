import type { UpdateCore } from '../types'
import { ScreenPackBuilderCore } from '../screen-pack-builder/core'
import { PackCreateNewCore } from './create-new-pack/core'

const updateCoreMain: UpdateCore = ({ modelCore, msgCore }) => {
  switch (msgCore.t) {
    case 'screen-pack-builder-open.user-clicked-pack-item': {
      return {
        ...modelCore,
        screen: {
          t: 'screen-pack-builder',
        },
        screenPackBuilder: ScreenPackBuilderCore.init({
          pack: msgCore.pack,
        }),
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
        modelCore,
      }),
    input.modelCore,
  )
}

export const ScreenPackBuilderOpenCore = {
  update: updateCore,
}
