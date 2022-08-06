export type NaturalNumber = number & { _opaque: typeof NaturalNumber }

declare const NaturalNumber: unique symbol

export const is = (naturalNumber: unknown): naturalNumber is NaturalNumber => {
  return (
    typeof naturalNumber === "number" &&
    naturalNumber >= 0 &&
    Math.floor(naturalNumber) === naturalNumber
  )
}

export const fromNumber = (number: number): NaturalNumber => {
  const naturalNumber = Math.abs(Math.trunc(number))

  if (is(naturalNumber)) {
    return naturalNumber
  }

  throw new Error("created invalid natural number")
}

export const add = (a: NaturalNumber, b: NaturalNumber): NaturalNumber => {
  const c = a + b
  return fromNumber(c)
}

export const subtract = (a: NaturalNumber, b: NaturalNumber): NaturalNumber => {
  const c = a - b
  return fromNumber(c)
}
