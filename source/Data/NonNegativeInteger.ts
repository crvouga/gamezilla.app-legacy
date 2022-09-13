export type NonNegativeInteger<T extends number> = number extends T
  ? never
  : `${T}` extends `-${string}` | `${string}.${string}`
  ? never
  : T

export const is = <T extends number>(
  number: unknown,
): number is NonNegativeInteger<T> => {
  return (
    typeof number === "number" && number >= 0 && Math.floor(number) === number
  )
}

export const floor = <T extends number>(number: T): NonNegativeInteger<T> => {
  const naturalNumber = Math.floor(Math.abs(number))

  if (is(naturalNumber)) {
    return naturalNumber
  }

  throw new Error("impossible case")
}

export const add = <T extends number>(
  a: NonNegativeInteger<T>,
  b: NonNegativeInteger<T>,
): NonNegativeInteger<T> => {
  return floor(a + b)
}

export const subtract = <T extends number>(
  a: NonNegativeInteger<T>,
  b: NonNegativeInteger<T>,
): NonNegativeInteger<T> => {
  return floor(a - b)
}
