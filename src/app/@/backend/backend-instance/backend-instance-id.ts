import { Uuid } from '~/@/id/uuid'
import { s } from '~/@/schema'

const parser = s.brand(s.str, 'BackendInstanceId')

export type BackendInstanceId = s.Infer<typeof parser>

const is = (backendInstanceId: unknown): backendInstanceId is BackendInstanceId => {
  return typeof backendInstanceId === 'string'
}

const namespace = 'backend-instance'
const separator = ':'

const generate = () => {
  const id = Uuid.generate()
  const randomIntegers = Math.floor(Math.random() * 1_000_000_000)
  const backendInstanceId = `${namespace}${separator}${id}${randomIntegers}`
  return backendInstanceId as BackendInstanceId
}

export const BackendInstanceId = {
  ...parser,
  generate,
  is,
}
