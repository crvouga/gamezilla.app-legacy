import { Ok } from '~/@/result'
import { ISync } from '~/@/sync-engine/sync'
import { IPackDb } from './pack-db/interface'
import { PackId } from './pack-id'

export const PackSync = (_config: { numberlinkPackDb: IPackDb }): ISync => {
  return {
    match({ entry }) {
      return PackId.is(entry.id)
    },
    async push() {
      return Ok(null)
    },
    async pull() {
      return Ok({ entries: [] })
    },
  }
}

export const PackItemSync = (_config: { numberlinkPackDb: IPackDb }): ISync => {
  return {
    match({ entry }) {
      return PackId.is(entry.id)
    },
    async push() {
      return Ok(null)
    },
    async pull() {
      return Ok({ entries: [] })
    },
  }
}
