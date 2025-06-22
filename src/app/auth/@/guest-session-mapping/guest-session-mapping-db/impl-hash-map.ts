import { Ok } from '~/@/result'
import { GuestSessionMapping } from '../guest-session-mapping'
import { GuestSessionMappingId } from '../guest-session-mapping-id'
import { IGuestSessionMappingDb } from './interface'

export type Config = {
  t: 'hash-map'
}

export const GuestSessionMappingDb = (_config: Config): IGuestSessionMappingDb => {
  const guestSessionMappings = new Map<GuestSessionMappingId, GuestSessionMapping>()
  return {
    async findUserIdBySessionId(sessionId) {
      const hits: GuestSessionMapping[] = []
      for (const [_id, guestSessionMapping] of guestSessionMappings.entries()) {
        if (guestSessionMapping.sessionId === sessionId) {
          hits.push(guestSessionMapping)
        }
      }
      return Ok(hits.map((hit) => hit.guestUserId)[0] ?? null)
    },
    async upsert(input) {
      guestSessionMappings.set(input.id, input)
      return Ok(null)
    },
    async findUserIdByClientSessionId(clientSessionId) {
      const hits: GuestSessionMapping[] = []
      for (const [_id, guestSessionMapping] of guestSessionMappings.entries()) {
        if (guestSessionMapping.clientSessionId === clientSessionId) {
          hits.push(guestSessionMapping)
        }
      }
      return Ok(hits.map((hit) => hit.guestUserId)[0] ?? null)
    },
  }
}
