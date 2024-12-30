import { Uuid } from '~/@/uuid/uuid'
import type { Brand } from '~/@/brand/brand'
import { p } from '~/@/parser'

export type UserId = Brand<string, 'UserId'>

const is = (userId: unknown): userId is UserId => {
  return typeof userId === 'string'
}

const parser = p.custom(is, 'Invalid user id')

const namespace = 'user'
const separator = ':'

const generate = () => {
  const id = Uuid.generate()
  const randomIntegers = Math.floor(Math.random() * 1000)
  const userId = `${namespace}${separator}${id}${randomIntegers}`

  if (is(userId)) {
    return userId
  }

  throw new Error('impossible condition. generated invalid user id.')
}

export const UserId = {
  ...parser,
  generate,
  is
}
