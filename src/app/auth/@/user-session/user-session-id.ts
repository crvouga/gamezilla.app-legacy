import type { Brand } from '~/@/brand/brand'
import { s } from '~/@/schema'
import { Uuid } from '~/@/id/uuid'

export type UserSessionId = Brand<string, 'UserSessionId'>

const is = (userSessionId: unknown): userSessionId is UserSessionId => {
  return typeof userSessionId === 'string' && userSessionId.length > 0
}

const schema = s.custom(is, 'Invalid user session id')

const generate = (): UserSessionId => {
  return Uuid.generate() as unknown as UserSessionId
}

export const UserSessionId = {
  ...schema,
  generate,
  is,
}
