import type { Brand } from '../brand/brand'

export type Uuid = Brand<string, 'Uuid'>

const is = (id: unknown): id is Uuid => {
  return typeof id === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id)
}

const generate = (): Uuid => {
  const hex = '0123456789abcdef'
  let uuid = ''

  for (let i = 0; i < 36; i++) {
    if (i === 8 || i === 13 || i === 18 || i === 23) {
      uuid += '-'
    } else if (i === 14) {
      uuid += '4' // Version 4
    } else if (i === 19) {
      uuid += hex[(Math.random() * 4) | (0 + 8)] // Variant
    } else {
      uuid += hex[(Math.random() * 16) | 0]
    }
  }

  return uuid as Uuid
}

export const Uuid = {
  generate,
  is,
}
