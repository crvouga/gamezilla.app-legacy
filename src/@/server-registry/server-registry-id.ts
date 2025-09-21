import type { Brand } from '~/@/brand/brand'
import { Uuid } from '~/@/id/uuid'
import { s } from '~/@/schema'

export type ServerRegistryId = Brand<string, 'ServerRegistryId'>

const is = (id: unknown): id is ServerRegistryId => {
  return typeof id === 'string' && id.startsWith('server-registry:')
}
const schema = s.custom(is, 'Invalid server registry id')

const namespace = 'server-registry'
const separator = ':'

const generate = () => {
  const id = Uuid.generate()
  const randomIntegers = Math.floor(Math.random() * 1000)
  const serverRegistryId = `${namespace}${separator}${id}${randomIntegers}`

  if (is(serverRegistryId)) {
    return serverRegistryId
  }

  throw new Error('impossible condition. generated invalid server registry id.')
}

export const ServerRegistryId = {
  ...schema,
  generate,
  is,
}
