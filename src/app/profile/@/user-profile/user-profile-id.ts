import type { Brand } from '~/@/brand/brand'
import { Uuid } from '~/@/id/uuid'
import { p } from '~/@/parser'

export type UserProfileId = Brand<string, 'UserProfileId'>

const is = (userProfileId: unknown): userProfileId is UserProfileId => {
  return typeof userProfileId === 'string'
}

const parser = p.custom(is, 'Invalid user profile id')

const namespace = 'user-profile'
const separator = ':'

const generate = () => {
  const id = Uuid.generate()
  const randomIntegers = Math.floor(Math.random() * 1000)
  const userProfileId = `${namespace}${separator}${id}${randomIntegers}`

  if (is(userProfileId)) {
    return userProfileId
  }

  throw new Error('impossible condition. generated invalid user id.')
}

export const UserProfileId = {
  ...parser,
  generate,
  is,
}
