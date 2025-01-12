import { Uuid } from '~/@/uuid/uuid'
import { p } from '~/@/parser'

const parser = p.brand(p.str, 'BackendInstanceId')

export type BackendInstanceId = p.Infer<typeof parser>

const is = (serverInstanceId: unknown): serverInstanceId is BackendInstanceId => {
  return typeof serverInstanceId === 'string'
}

const namespace = 'server-instance'
const separator = ':'

const generate = () => {
  const id = Uuid.generate()
  const randomIntegers = Math.floor(Math.random() * 1_000_000_000)
  const serverInstanceId = `${namespace}${separator}${id}${randomIntegers}`
  return serverInstanceId as BackendInstanceId
}

export const BackendInstanceId = {
  ...parser,
  generate,
  is,
}
