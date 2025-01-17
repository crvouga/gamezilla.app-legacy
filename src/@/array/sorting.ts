export const ascend = <T>(...keyFns: Array<(value: T) => number | string>) => {
  return (a: T, b: T): number => {
    for (const keyFn of keyFns) {
      const aValue = keyFn(a)
      const bValue = keyFn(b)

      if (aValue < bValue) {
        return -1
      }
      if (aValue > bValue) {
        return 1
      }
    }
    return 0
  }
}

export const descend = <T>(...keyFns: Array<(value: T) => number | string>) => {
  return (a: T, b: T): number => {
    for (const keyFn of keyFns) {
      const aValue = keyFn(a)
      const bValue = keyFn(b)

      if (aValue > bValue) {
        return -1
      }
      if (aValue < bValue) {
        return 1
      }
    }
    return 0
  }
}
