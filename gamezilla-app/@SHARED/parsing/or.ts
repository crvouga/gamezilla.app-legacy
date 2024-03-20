import { l } from "./parsing-v2"

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
export function or<A, B, C, D, E, F, G, H, I, J, K, L>(
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
  isL: (x: unknown) => x is K,
): (x: unknown) => x is A | B | C | D | E | F | G | H | I | J | K | L
export function or<A, B, C, D, E, F, G, H, I, J, K, L, M>(
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
  isL: (x: unknown) => x is K,
  isM: (x: unknown) => x is M,
): (x: unknown) => x is A | B | C | D | E | F | G | H | I | J | K | L | M
export function or<A, B, C, D, E, F, G, H, I, J, K, L, M, N>(
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
  isL: (x: unknown) => x is K,
  isM: (x: unknown) => x is M,
  isN: (x: unknown) => x is N,
): (x: unknown) => x is A | B | C | D | E | F | G | H | I | J | K | L | M | N
export function or<A, B, C, D, E, F, G, H, I, J, K, L, M, N, O>(
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
  isL: (x: unknown) => x is K,
  isM: (x: unknown) => x is M,
  isN: (x: unknown) => x is N,
  isO: (x: unknown) => x is O,
): (
  x: unknown,
) => x is A | B | C | D | E | F | G | H | I | J | K | L | M | N | O
export function or<A, B, C, D, E, F, G, H, I, J, K, L, M, N, O, P>(
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
  isL: (x: unknown) => x is K,
  isM: (x: unknown) => x is M,
  isN: (x: unknown) => x is N,
  isO: (x: unknown) => x is O,
  isP: (x: unknown) => x is P,
): (
  x: unknown,
) => x is A | B | C | D | E | F | G | H | I | J | K | L | M | N | O | P
export function or<A, B, C, D, E, F, G, H, I, J, K, L, M, N, O, P, Q>(
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
  isL: (x: unknown) => x is K,
  isM: (x: unknown) => x is M,
  isN: (x: unknown) => x is N,
  isO: (x: unknown) => x is O,
  isP: (x: unknown) => x is P,
  isQ: (x: unknown) => x is Q,
): (
  x: unknown,
) => x is A | B | C | D | E | F | G | H | I | J | K | L | M | N | O | P | Q
export function or(
  ...guards: ((x: unknown) => x is any)[]
): (x: unknown) => x is any {
  return (input: unknown): input is any => {
    for (const guard of guards) {
      if (guard(input)) return true
    }
    return false
  }
}

export const isEnum = or(
  l("a"),
  l("b"),
  l("c"),
  l("d"),
  l("e"),
  l("f"),
  l("g"),
  l("h"),
  l("i"),
  l("j"),
  l("k"),
  l("l"),
  l("m"),
  l("n"),
  l("o"),
  l("p"),
  l("q"),
)
