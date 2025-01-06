import type { UpdateCore } from '../../types'

const update: UpdateCore = (input) => {
  switch (input.msgCore.t) {
    default: {
      return input.modelCore
    }
  }
}

export const PackCreateNewCore = {
  update,
}
