import { Uuid } from '~/@/id/uuid'
import { s } from '~/@/schema'

const schema = s.brand(s.str(), 'BackendInstanceId')

export type BackendInstanceId = s.Infer<typeof schema>

const is = (backendInstanceId: unknown): backendInstanceId is BackendInstanceId => {
  return typeof backendInstanceId === 'string' && Uuid.is(backendInstanceId)
}

const generate = (): BackendInstanceId => {
  return Uuid.generate() as unknown as BackendInstanceId
}

export const BackendInstanceId = {
  ...schema,
  generate,
  is,
}
