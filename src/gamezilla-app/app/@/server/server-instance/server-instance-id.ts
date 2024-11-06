import { Uuid } from 'gamezilla-app/@/core'
import { p } from 'gamezilla-app/@/core/parser'

const parser = p.brand(p.str, 'ServerInstanceId')

export type ServerInstanceId = p.Infer<typeof parser>

const is = (serverInstanceId: unknown): serverInstanceId is ServerInstanceId => {
  return typeof serverInstanceId === 'string'
}

const namespace = 'server-instance'
const separator = ':'

const generate = () => {
  const id = Uuid.generate()
  const randomIntegers = Math.floor(Math.random() * 1000)
  const serverInstanceId = `${namespace}${separator}${id}${randomIntegers}`
  return serverInstanceId as ServerInstanceId
}

export const ServerInstanceId = {
  ...parser,
  generate,
  is
}
