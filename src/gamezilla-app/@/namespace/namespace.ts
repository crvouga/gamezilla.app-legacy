export type Namespaced<TNamespace extends string, T extends Record<string, unknown>> = {
  [K in keyof T as `${TNamespace}${string & K}`]: T[K]
}

export const namespace = <TNamespace extends string, T extends Record<string, unknown>>(
  namespace: TNamespace,
  value: T
): Namespaced<TNamespace, T> => {
  const result = {} as Namespaced<TNamespace, T>
  for (const key in value) {
    // @ts-ignore
    result[`${namespace}${key}`] = value[key]
  }
  return result
}

export const unnamespace = <TNamespace extends string, T extends Record<string, unknown>>(
  namespace: TNamespace,
  value: Namespaced<TNamespace, T>
): T => {
  const result = {} as T
  for (const key in value) {
    if (key.startsWith(namespace)) {
      // @ts-ignore
      result[key.slice(namespace.length)] = value[key]
    }
  }
  return result
}
