import type { Brand } from '~/@/brand/brand'
import { s } from '~/@/schema'
import { Uuid } from '~/@/id/uuid'

export type GuestSessionMappingId = Brand<string, 'GuestSessionMappingId'>

const is = (guestSessionMappingId: unknown): guestSessionMappingId is GuestSessionMappingId => {
  return typeof guestSessionMappingId === 'string' && guestSessionMappingId.length > 0
}

const schema = s.custom(is, 'Invalid guest session mapping id')

const generate = (): GuestSessionMappingId => {
  return Uuid.generate() as unknown as GuestSessionMappingId
}

export const GuestSessionMappingId = {
  ...schema,
  generate,
  is,
}
