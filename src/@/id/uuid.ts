import type { Brand } from '../brand/brand'

export type Uuid = Brand<string, 'Uuid'>

const is = (id: unknown): id is Uuid => {
  return typeof id === 'string'
}

const generate = (): Uuid => {
  return crypto.randomUUID() as Uuid
}

export const Uuid = {
  generate,
  is,
}
