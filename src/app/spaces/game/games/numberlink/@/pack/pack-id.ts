import type { Brand } from '~/@/brand/brand'
import { s } from '~/@/schema'
import { Uuid } from '~/@/id/uuid'

export type PackId = Brand<string, 'PackId'>

const is = (id: unknown): id is PackId => {
  return typeof id === 'string' && id.length > 0
}

const schema = s.custom(is, 'Invalid pack id')

const generate = (): PackId => {
  return Uuid.generate() as unknown as PackId
}

export const PackId = {
  ...schema,
  is,
  generate,
}
