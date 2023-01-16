export type NonNegInt = number & { _opaque: "NonNegInt" }

const is = (number: unknown): number is NonNegInt => {
  return (
    typeof number === "number" && number >= 0 && Math.floor(number) === number
  )
}

const floor = (number: number): NonNegInt => {
  const naturalNumber = Math.floor(Math.abs(number))

  if (is(naturalNumber)) {
    return naturalNumber
  }

  throw new Error("impossible case")
}

const add = (a: NonNegInt, b: NonNegInt): NonNegInt => {
  return floor(a + b)
}

const sub = (a: NonNegInt, b: NonNegInt): NonNegInt => {
  return floor(a - b)
}

const inc = (a: NonNegInt): NonNegInt => {
  return floor(a + 1)
}

export const NonNegInt = {
  sub,
  add,
  floor,
  is,
  inc,
}
