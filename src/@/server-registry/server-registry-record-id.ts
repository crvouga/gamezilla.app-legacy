import type { Brand } from '~/@/brand/brand'
import { Uuid } from '~/@/id/uuid'
import { s } from '~/@/schema'

export type ServerRegistryId = Brand<string, 'ServerRegistryId'>

const is = (id: unknown): id is ServerRegistryId => {
  return typeof id === 'string' && Uuid.is(id)
}
const schema = s.custom(is, 'Invalid server registry id')

const generate = (): ServerRegistryId => {
  return Uuid.generate() as unknown as ServerRegistryId
}

export const ServerRegistryId = {
  ...schema,
  generate,
  is,
}
