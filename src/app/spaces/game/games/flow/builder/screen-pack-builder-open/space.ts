import type { UpdateSpace } from '../types'
import { ScreenPackBuilderSpace } from '../screen-pack-builder/space'
import { PackCreateNewSpace } from './create-new-pack/space'

const updateSpaceMain: UpdateSpace = ({ modelSpace, msgSpace }) => {
  switch (msgSpace.t) {
    case 'screen-pack-builder-open.user-clicked-pack-item': {
      return {
        ...modelSpace,
        screen: {
          t: 'screen-pack-builder',
        },
        screenPackBuilder: ScreenPackBuilderSpace.init({
          pack: msgSpace.pack,
        }),
      }
    }

    default: {
      return modelSpace
    }
  }
}

const updateSpace: UpdateSpace = (input) => {
  return [PackCreateNewSpace.update, updateSpaceMain].reduce(
    (modelSpace, updateSpace) =>
      updateSpace({
        ...input,
        modelSpace,
      }),
    input.modelSpace,
  )
}

export const ScreenPackBuilderOpenSpace = {
  update: updateSpace,
}
