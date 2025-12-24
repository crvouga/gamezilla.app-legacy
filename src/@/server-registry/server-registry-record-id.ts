import type { Brand } from '~/@/brand/brand'
import { s } from '~/@/schema'
import { Uuid } from '~/@/id/uuid'

export type ServerRegistryId = Brand<string, 'ServerRegistryId'>

const is = (id: unknown): id is ServerRegistryId => {
  return typeof id === 'string' && id.length > 0
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
