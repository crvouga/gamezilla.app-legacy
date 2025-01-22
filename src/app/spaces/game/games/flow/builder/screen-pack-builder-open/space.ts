import type { UpdateSpace } from '../types'
import { ScreenPackBuilderSpace } from '../screen-pack-builder/space'
import { PackCreateNewSpace } from './button-create-new-pack/space'

const updateSpaceMain: UpdateSpace = ({ modelSpace, msgSpace }) => {
  switch (msgSpace.t) {
    case 'screen-pack-builder-open.user-clicked-pack-item': {
      return {
        ...modelSpace,
        screen: {
          t: 'screen-pack-builder',
        },
        screenPackBuilder: ScreenPackBuilderSpace.initSpace({
          pack: msgSpace.pack,
        }),
      }
    }

    default: {
      return modelSpace
    }
  }
}
const updates = [PackCreateNewSpace.update, updateSpaceMain]

const updateSpace: UpdateSpace = (input) => {
  return updates.reduce((modelSpace, updateSpace) => updateSpace({ ...input, modelSpace }), input.modelSpace)
}

export const ScreenPackBuilderOpenSpace = {
  update: updateSpace,
}
