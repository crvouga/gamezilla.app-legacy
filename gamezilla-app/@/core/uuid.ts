import type { Brand } from './brand'

export type Uuid = Brand<string, 'Uuid'>

const is = (id: unknown): id is Uuid => {
  return typeof id === 'string'
}

const generate = (): Uuid => {
  let d = new Date().getTime()
  let d2 = (performance?.now && performance.now() * 1000) || 0

  const uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    let r = Math.random() * 16
    if (d > 0) {
      r = (d + r) % 16 | 0
      d = Math.floor(d / 16)
    } else {
      r = (d2 + r) % 16 | 0
      d2 = Math.floor(d2 / 16)
    }
    return (c === 'x' ? r : (r & 0x7) | 0x8).toString(16)
  })

  if (is(uuid)) {
    return uuid
  }

  throw new Error('generated invalid uuid')
}

export const Uuid = {
  generate,
  is
}
