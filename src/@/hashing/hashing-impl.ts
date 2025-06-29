import type { IHashing } from './hashing'
import * as ImplNoop from './hashing-impl-noop'

export type HashingImpl =
  | {
      t: 'node'
    }
  | {
      t: 'noop'
    }

export const Hashing = async (impl: HashingImpl): Promise<IHashing> => {
  switch (impl.t) {
    case 'node': {
      const ImplNode = await import('./hashing-impl-node')
      return ImplNode.Hashing()
    }

    case 'noop': {
      return ImplNoop.Hashing()
    }
  }
}
