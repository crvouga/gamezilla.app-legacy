export const deinterleave = <T>(xs: T[]): [T[], T[]] => {
  const ys: T[] = []
  const zs: T[] = []
  for (let i = 0; i < xs.length; i++) {
    const x = xs[i]
    if (!x) {
      continue
    }
    if (i % 2 === 0) {
      ys.push(x)
    } else {
      zs.push(x)
    }
  }
  return [ys, zs]
}

export const interleave = <T>(a: T[], b: T[]): T[] => {
  const [head, ...tail] = a
  if (!head) {
    return b
  }
  return [head, ...interleave(b, tail)]
}

export const zip = <A, B>(a: A[], b: B[]): [A, B][] => {
  const result: [A, B][] = []
  const length = Math.min(a.length, b.length)
  for (let i = 0; i < length; i++) {
    const a_ = a[i]
    const b_ = b[i]
    if (a_ && b_) {
      result.push([a_, b_])
    }
  }
  return result
}

export const splitEvery = <T>(n: number, xs: T[]): T[][] => {
  const partitions: T[][] = []

  let partition: T[] = []

  for (let i = 0; i < xs.length; i++) {
    const x = xs[i]

    if (!x) {
      continue
    }

    partition.push(x)

    if (partition.length >= n) {
      partitions.push(partition)
      partition = []
    }
  }

  return partitions
}
