import type { Brand } from '~/@/brand/brand'
import { Uuid } from '~/@/id/uuid'
import { s } from '~/@/schema'

export type GuestSessionMappingId = Brand<string, 'GuestSessionMappingId'>

const is = (guestSessionMappingId: unknown): guestSessionMappingId is GuestSessionMappingId => {
  return typeof guestSessionMappingId === 'string' && Uuid.is(guestSessionMappingId)
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
