type NullishItems<T> = T | null | undefined | Array<NullishItems<T>>

const batch = <T>(...msgs: Array<NullishItems<T>>): Array<T> => {
  const flattened: Array<T> = []

  const stack = [...msgs]

  while (stack.length > 0) {
    const item = stack.pop()

    if (Array.isArray(item)) {
      stack.push(...item)
      continue
    }

    if (item !== null && item !== undefined) {
      flattened.push(item)
      continue
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

const isAny = (msg: unknown): msg is AnyMsg => {
  return typeof msg === 'object' && msg !== null && 't' in msg
}

const hasNamespace = (msg: unknown): msg is { n: string } =>
  typeof msg === 'object' && msg !== null && 'n' in msg && typeof (msg as any).n === 'string'

const toNamespace = (msg: unknown): string => (hasNamespace(msg) ? msg.n : '')

const toType = (msg: unknown): string => {
  const namespace = toNamespace(msg)
  if (namespace && isAny(msg)) {
    return `${namespace}.${msg.t}`
  }
  if (!isAny(msg)) {
    return String(msg)
  }

  if (isAny(msg.c)) {
    return `${msg.t}.${toType(msg.c)}`
  }
  return msg.t
}

const toPayload = (msg: unknown, acc: Record<string, unknown> = {}): Record<string, unknown> => {
  if (!isAny(msg)) {
    return acc
  }
  const { t, c, ...payload } = msg
  if (isAny(msg.c)) {
    return toPayload(msg.c, {
      ...acc,
      ...payload,
    })
  }
  return { ...acc, ...payload }
}

export const Msg = {
  batch,
  isAny,
  toType,
  toPayload,
}
