export type NonNegativeInteger = number & { _opaque: typeof NonNegativeInteger }

declare const NonNegativeInteger: unique symbol

export const is = (number: unknown): number is NonNegativeInteger => {
  return (
    typeof number === "number" &&
    number >= 0 &&
    Math.floor(number) === number
  )
}

export const floor = (number: number): NonNegativeInteger => {
  const naturalNumber = Math.floor(Math.abs(number))

  if (is(naturalNumber)) {
    return naturalNumber
  }

  throw new Error("created invalid natural number")
}

export const add = (a: NonNegativeInteger, b: NonNegativeInteger): NonNegativeInteger => {
  return floor(a + b)
}

export const subtract = (a: NonNegativeInteger, b: NonNegativeInteger): NonNegativeInteger => {
  return floor(a - b)
}
