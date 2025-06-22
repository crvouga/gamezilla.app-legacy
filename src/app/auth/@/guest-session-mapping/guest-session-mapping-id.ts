import type { Brand } from '~/@/brand/brand'
import { Uuid } from '~/@/id/uuid'
import { s } from '~/@/schema'

export type GuestSessionMappingId = Brand<string, 'GuestSessionMappingId'>

const namespace = 'guest-session-mapping'
const separator = ':'

const is = (guestSessionMappingId: unknown): guestSessionMappingId is GuestSessionMappingId => {
  return typeof guestSessionMappingId === 'string' && guestSessionMappingId.startsWith(namespace)
}

const schema = s.custom(is, 'Invalid guest session mapping id')

const generate = () => {
  const id = Uuid.generate()
  const randomIntegers = Math.floor(Math.random() * 1000)
  const guestSessionMappingId = `${namespace}${separator}${id}${randomIntegers}`

  if (is(guestSessionMappingId)) {
    return guestSessionMappingId
  }

  throw new Error('impossible condition. generated invalid user session id.')
}

export const GuestSessionMappingId = {
  ...schema,
  generate,
  is,
}
