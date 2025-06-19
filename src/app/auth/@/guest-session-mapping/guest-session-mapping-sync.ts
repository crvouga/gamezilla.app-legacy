import { Ok } from '~/@/result'
import { ISync } from '~/@/sync-engine/sync'
import { IGuestSessionMappingDb } from './guest-session-mapping-db/interface'
import { GuestSessionMappingId } from './guest-session-mapping-id'

export const GuestSessionMappingSync = (_config: { guestSessionMappingDb: IGuestSessionMappingDb }): ISync => {
  return {
    match({ entry }) {
      return GuestSessionMappingId.is(entry.id)
    },
    async push({}) {
      return Ok(null)
    },
    async pull(_input) {
      return Ok({ entries: [] })
    },
  }
}
