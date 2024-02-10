type Entry<T> = {
  [K in keyof T]: [K, T[K]]
}[keyof T]

export const filterObject = <T extends object>(
  obj: T,
  predicate: (entry: Entry<T>, i: number, arr: Entry<T>[]) => boolean,
): T => {
  const filtered = (Object.entries(obj) as Entry<T>[]).filter(predicate)
  return Object.fromEntries(filtered) as T
}
