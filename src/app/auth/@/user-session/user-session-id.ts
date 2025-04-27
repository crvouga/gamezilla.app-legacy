import { Uuid } from '~/@/uuid/uuid'
import type { Brand } from '~/@/brand/brand'
import { p } from '~/@/parser'

export type UserSessionId = Brand<string, 'UserSessionId'>

const is = (userSessionId: unknown): userSessionId is UserSessionId => {
  return typeof userSessionId === 'string'
}

const parser = p.custom(is, 'Invalid user session id')

const namespace = 'user-session'
const separator = ':'

const generate = () => {
  const id = Uuid.generate()
  const randomIntegers = Math.floor(Math.random() * 1000)
  const userSessionId = `${namespace}${separator}${id}${randomIntegers}`

  if (is(userSessionId)) {
    return userSessionId
  }

  throw new Error('impossible condition. generated invalid user session id.')
}

export const UserSessionId = {
  ...parser,
  generate,
  is,
}
