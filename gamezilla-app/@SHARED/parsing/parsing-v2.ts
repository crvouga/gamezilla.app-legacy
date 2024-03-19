export type Validator<T> = (input: unknown) => input is T
export type Infer<T> = T extends Validator<infer U> ? U : never
export type InferDict<T extends string | number, U extends string | number> = {
  // @ts-ignore
  [K in Infer<T>]: Infer<U>
}

export function any(_x: unknown): _x is any {
  return true
}

export function obj<T extends Record<string, Validator<unknown>>>(
  schema: T,
): Validator<{ [K in keyof T]: Infer<T[K]> }> {
  return (input: unknown): input is { [K in keyof T]: Infer<T[K]> } => {
    if (typeof input !== "object" || input === null) return false
    for (const key in schema) {
      // @ts-ignore
      if (!(key in input) || !schema[key](input[key])) return false
    }
    return true
  }
}

export function arr<T extends Validator<unknown>>(
  itemValidator: T,
): Validator<Infer<T>[]> {
  return (input: unknown): input is Infer<T>[] => {
    if (!Array.isArray(input)) return false
    for (const item of input) {
      if (!itemValidator(item)) return false
    }
    return true
  }
}

export function dict<
  T extends Validator<unknown>,
  U extends Validator<unknown>,
>(
  keyValidator: T,
  valueValidator: U,
): Validator<
  InferDict<
    // @ts-ignore
    T,
    U
  >
> {
  return (
    input: unknown,
  ): input is InferDict<
    // @ts-ignore
    T,
    U
  > => {
    if (typeof input !== "object" || input === null) {
      return false
    }

    for (const key in input) {
      if (
        !keyValidator(key) ||
        !valueValidator(
          // @ts-ignore
          input[key],
        )
      )
        return false
    }
    return true
  }
}

export function nullish(x: unknown): x is null | undefined {
  return x === null || x === undefined
}

export function discrimatedUnion<T extends string, U extends Record<T, string>>(
  tag: T,
  // @ts-ignore
  union: U,
): Validator<
  {
    [K in keyof U]: {
      [P in T]: K
    } & U[K]
  }[keyof U]
> {
  return (input: unknown): input is any => {
    if (typeof input !== "object" || input === null) return false
    // @ts-ignore
    const tagValue = input[tag]
    if (typeof tagValue !== "string") return false
    // @ts-ignore
    const validator = union[tagValue]
    if (!validator) return false
    return validator(input)
  }
}

export function or<A>(isA: (x: unknown) => x is A): (x: unknown) => x is A
export function or<A, B>(
  isA: (x: unknown) => x is A,
  isB: (x: unknown) => x is B,
): (x: unknown) => x is A | B
export function or<A, B, C>(
  isA: (x: unknown) => x is A,
  isB: (x: unknown) => x is B,
  isC: (x: unknown) => x is C,
): (x: unknown) => x is A | B | C
export function or<A, B, C, D>(
  isA: (x: unknown) => x is A,
  isB: (x: unknown) => x is B,
  isC: (x: unknown) => x is C,
  isD: (x: unknown) => x is D,
): (x: unknown) => x is A | B | C | D
export function or<A, B, C, D, E>(
  isA: (x: unknown) => x is A,
  isB: (x: unknown) => x is B,
  isC: (x: unknown) => x is C,
  isD: (x: unknown) => x is D,
  isE: (x: unknown) => x is E,
): (x: unknown) => x is A | B | C | D | E
export function or<A, B, C, D, E, F>(
  isA: (x: unknown) => x is A,
  isB: (x: unknown) => x is B,
  isC: (x: unknown) => x is C,
  isD: (x: unknown) => x is D,
  isE: (x: unknown) => x is E,
  isF: (x: unknown) => x is F,
): (x: unknown) => x is A | B | C | D | E | F
export function or<A, B, C, D, E, F, G>(
  isA: (x: unknown) => x is A,
  isB: (x: unknown) => x is B,
  isC: (x: unknown) => x is C,
  isD: (x: unknown) => x is D,
  isE: (x: unknown) => x is E,
  isF: (x: unknown) => x is F,
  isG: (x: unknown) => x is G,
): (x: unknown) => x is A | B | C | D | E | F | G
export function or<A, B, C, D, E, F, G, H>(
  isA: (x: unknown) => x is A,
  isB: (x: unknown) => x is B,
  isC: (x: unknown) => x is C,
  isD: (x: unknown) => x is D,
  isE: (x: unknown) => x is E,
  isF: (x: unknown) => x is F,
  isG: (x: unknown) => x is G,
  isH: (x: unknown) => x is H,
): (x: unknown) => x is A | B | C | D | E | F | G | H
export function or<A, B, C, D, E, F, G, H, I>(
  isA: (x: unknown) => x is A,
  isB: (x: unknown) => x is B,
  isC: (x: unknown) => x is C,
  isD: (x: unknown) => x is D,
  isE: (x: unknown) => x is E,
  isF: (x: unknown) => x is F,
  isG: (x: unknown) => x is G,
  isH: (x: unknown) => x is H,
  isI: (x: unknown) => x is I,
): (x: unknown) => x is A | B | C | D | E | F | G | H | I
export function or<A, B, C, D, E, F, G, H, I, J>(
  isA: (x: unknown) => x is A,
  isB: (x: unknown) => x is B,
  isC: (x: unknown) => x is C,
  isD: (x: unknown) => x is D,
  isE: (x: unknown) => x is E,
  isF: (x: unknown) => x is F,
  isG: (x: unknown) => x is G,
  isH: (x: unknown) => x is H,
  isI: (x: unknown) => x is I,
  isJ: (x: unknown) => x is J,
): (x: unknown) => x is A | B | C | D | E | F | G | H | I | J
export function or<A, B, C, D, E, F, G, H, I, J, K>(
  isA: (x: unknown) => x is A,
  isB: (x: unknown) => x is B,
  isC: (x: unknown) => x is C,
  isD: (x: unknown) => x is D,
  isE: (x: unknown) => x is E,
  isF: (x: unknown) => x is F,
  isG: (x: unknown) => x is G,
  isH: (x: unknown) => x is H,
  isI: (x: unknown) => x is I,
  isJ: (x: unknown) => x is J,
  isK: (x: unknown) => x is K,
): (x: unknown) => x is A | B | C | D | E | F | G | H | I | J | K
// export function or<A, B, C, D, E, F, G, H, I, J, K, L>(
//   isA: (x: unknown) => x is A,
//   isB: (x: unknown) => x is B,
//   isC: (x: unknown) => x is C,
//   isD: (x: unknown) => x is D,
//   isE: (x: unknown) => x is E,
//   isF: (x: unknown) => x is F,
//   isG: (x: unknown) => x is G,
//   isH: (x: unknown) => x is H,
//   isI: (x: unknown) => x is I,
//   isJ: (x: unknown) => x is J,
//   isK: (x: unknown) => x is K,
//   isL: (x: unknown) => x is K,
// ): (x: unknown) => x is A | B | C | D | E | F | G | H | I | J | K | L
// export function or<A, B, C, D, E, F, G, H, I, J, K, L, M>(
//   isA: (x: unknown) => x is A,
//   isB: (x: unknown) => x is B,
//   isC: (x: unknown) => x is C,
//   isD: (x: unknown) => x is D,
//   isE: (x: unknown) => x is E,
//   isF: (x: unknown) => x is F,
//   isG: (x: unknown) => x is G,
//   isH: (x: unknown) => x is H,
//   isI: (x: unknown) => x is I,
//   isJ: (x: unknown) => x is J,
//   isK: (x: unknown) => x is K,
//   isL: (x: unknown) => x is K,
//   isM: (x: unknown) => x is M,
// ): (x: unknown) => x is A | B | C | D | E | F | G | H | I | J | K | L | M
// export function or<A, B, C, D, E, F, G, H, I, J, K, L, M, N>(
//   isA: (x: unknown) => x is A,
//   isB: (x: unknown) => x is B,
//   isC: (x: unknown) => x is C,
//   isD: (x: unknown) => x is D,
//   isE: (x: unknown) => x is E,
//   isF: (x: unknown) => x is F,
//   isG: (x: unknown) => x is G,
//   isH: (x: unknown) => x is H,
//   isI: (x: unknown) => x is I,
//   isJ: (x: unknown) => x is J,
//   isK: (x: unknown) => x is K,
//   isL: (x: unknown) => x is K,
//   isM: (x: unknown) => x is M,
//   isN: (x: unknown) => x is N,
// ): (x: unknown) => x is A | B | C | D | E | F | G | H | I | J | K | L | M | N
export function or(...guards: Validator<unknown>[]): Validator<unknown> {
  return (input: unknown): input is any => {
    for (const guard of guards) {
      if (guard(input)) return true
    }
    return false
  }
}

export function str(x: unknown): x is string {
  return typeof x === "string"
}

export function num(x: unknown): x is number {
  return typeof x === "number"
}

export function bool(x: unknown): x is boolean {
  return typeof x === "boolean"
}

export function l<T extends string>(literal: T) {
  return (x: unknown): x is T => {
    return x === literal
  }
}

export function union<T>(typeGuards: Validator<T>[]): Validator<T> {
  return (x: any): x is T => {
    for (const guard of typeGuards) {
      if (guard(x)) {
        return true
      }
    }
    return false
  }
}

//
//
//
//
//
//
//

type MyCar_ = {
  make: string
  model: string
  year: string
  owners?: { [key: string]: string } | null
}

const isMyCar: (unknown: unknown) => unknown is MyCar_ = obj({
  make: str,
  model: str,
  year: str,
  owners: or(dict(str, str), nullish),
})

export type MyCar = Infer<typeof isMyCar>

const x = { make: "Toyota", model: "Corolla", year: "2005" }
if (isMyCar(x)) {
}
