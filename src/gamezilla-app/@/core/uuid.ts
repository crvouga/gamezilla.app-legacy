import type { Brand } from './brand'

export type Uuid = Brand<string, 'Uuid'>

const is = (id: unknown): id is Uuid => {
  return typeof id === 'string'
}

const generate = (): Uuid => {
  const uuid = crypto.randomUUID()

  if (is(uuid)) {
    return uuid
  }

  throw new Error('generated invalid uuid')
}

export const Uuid = {
  generate,
  is
}
