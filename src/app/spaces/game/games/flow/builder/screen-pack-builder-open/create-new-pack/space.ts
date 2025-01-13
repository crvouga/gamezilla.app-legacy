import type { UpdateSpace } from '../../types'

const update: UpdateSpace = (input) => {
  switch (input.msgSpace.t) {
    default: {
      return input.modelSpace
    }
  }
}

export const PackCreateNewSpace = {
  update,
}
