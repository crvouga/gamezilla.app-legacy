import { Uuid } from '~/@/id/uuid'
import type { Brand } from '~/@/brand/brand'
import { s } from '~/@/schema'

export type UserProfileId = Brand<string, 'UserProfileId'>

const is = (userId: unknown): userId is UserProfileId => {
  return typeof userId === 'string' && userId.startsWith(namespace)
}

const schema = s.custom(is, 'Invalid user profile id')

const namespace = 'user-profile'
const separator = ':'

const generate = () => {
  const id = Uuid.generate()
  const randomIntegers = Math.floor(Math.random() * 1000)
  const userId = `${namespace}${separator}${id}${randomIntegers}`

  if (is(userId)) {
    return userId
  }

  throw new Error('impossible condition. generated invalid user profile id.')
}

export const UserProfileId = {
  ...schema,
  generate,
  is,
}
