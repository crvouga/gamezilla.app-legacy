import { Uuid } from '~/@/id/uuid'
import type { Brand } from '~/@/brand/brand'
import { s } from '~/@/schema'

export type UserId = Brand<string, 'UserId'>

const is = (userId: unknown): userId is UserId => {
  return typeof userId === 'string' && userId.length > 0
}
const schema = s.custom(is, 'Invalid user id')

const generate = (): UserId => {
  return Uuid.generate() as unknown as UserId
}

export const UserId = {
  ...schema,
  generate,
  is,
}
