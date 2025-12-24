import { Uuid } from '~/@/id/uuid'
import type { Brand } from '~/@/brand/brand'
import { s } from '~/@/schema'

export type UserProfileId = Brand<string, 'UserProfileId'>

const is = (userId: unknown): userId is UserProfileId => {
  return typeof userId === 'string' && Uuid.is(userId)
}

const schema = s.custom(is, 'Invalid user profile id')

const generate = (): UserProfileId => {
  return Uuid.generate() as unknown as UserProfileId
}

export const UserProfileId = {
  ...schema,
  generate,
  is,
}
