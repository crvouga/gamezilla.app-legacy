import { Ok } from '~/@/result'
import { ISyncEntry } from '~/@/sync-engine/sync-entry'
import { IPackDb } from './pack-db/interface'
import { PackId } from './pack-id'

export const PackSync = (_config: { numberlinkPackDb: IPackDb }): ISyncEntry => {
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

export const PackItemSync = (_config: { numberlinkPackDb: IPackDb }): ISyncEntry => {
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
