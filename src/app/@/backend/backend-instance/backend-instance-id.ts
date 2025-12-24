import type { Brand } from '~/@/brand/brand'
import { s } from '~/@/schema'
import { Uuid } from '~/@/id/uuid'

export type BackendInstanceId = Brand<string, 'BackendInstanceId'>

const is = (backendInstanceId: unknown): backendInstanceId is BackendInstanceId => {
  return typeof backendInstanceId === 'string' && backendInstanceId.length > 0
}

const schema = s.custom(is, 'Invalid backend instance id')

const generate = (): BackendInstanceId => {
  return Uuid.generate() as unknown as BackendInstanceId
}

export const BackendInstanceId = {
  ...schema,
  generate,
  is,
}
