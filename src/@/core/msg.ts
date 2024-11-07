type NullishItems<T> = T | null | undefined | Array<NullishItems<T>>

const batch = <T>(...msgs: Array<NullishItems<T>>): Array<T> => {
  const flattened: Array<T> = []

  const stack = [...msgs]

  while (stack.length > 0) {
    const item = stack.pop()

    if (Array.isArray(item)) {
      stack.push(...item)
    } else if (item !== null && item !== undefined) {
      flattened.push(item)
    }
  }

  return flattened.reverse()
}

export type Msg = {
  t: string
}

export type AnyMsg = Record<string, unknown> & {
  t: string
  c?: unknown
}

export const isAnyMsg = (msg: unknown): msg is AnyMsg => {
  return typeof msg === 'object' && msg !== null && 't' in msg
}

const hasNamespace = (msg: unknown): msg is { n: string } =>
  typeof msg === 'object' && msg !== null && 'n' in msg && typeof (msg as any).n === 'string'

const toNamespace = (msg: unknown): string => (hasNamespace(msg) ? msg.n : '')

export const toMsgType = (msg: unknown): string => {
  const namespace = toNamespace(msg)
  if (namespace && isAnyMsg(msg)) {
    return `${namespace}.${msg.t}`
  }
  if (!isAnyMsg(msg)) {
    return String(msg)
  }

  if (isAnyMsg(msg.c)) {
    return `${msg.t}.${toMsgType(msg.c)}`
  }
  return msg.t
}

export const toMsgPayload = (msg: unknown, acc: Record<string, unknown> = {}): Record<string, unknown> => {
  if (!isAnyMsg(msg)) {
    return acc
  }
  const { t, c, ...payload } = msg
  if (isAnyMsg(msg.c)) {
    return toMsgPayload(msg.c, {
      ...acc,
      ...payload
    })
  }
  return { ...acc, ...payload }
}

export const Msg = {
  batch,
  isAnyMsg,
  toMsgType,
  toMsgPayload
}
