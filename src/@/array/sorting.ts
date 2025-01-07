export const descend = <T>(keyFn: (value: T) => number | string) => {
  return (a: T, b: T): number => {
    const aValue = keyFn(a)
    const bValue = keyFn(b)

    if (aValue > bValue) {
      return -1
    }

    if (aValue < bValue) {
      return 1
    }

    return 0
  }
}

export const ascend = <T>(keyFn: (value: T) => number | string) => {
  return (a: T, b: T): number => {
    const aValue = keyFn(a)
    const bValue = keyFn(b)

    if (aValue > bValue) {
      return 1
    }

    if (aValue < bValue) {
      return -1
    }

    return 0
  }
}
