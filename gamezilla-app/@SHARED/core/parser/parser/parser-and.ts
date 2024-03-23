import { err, ok } from "../../result/result"
import { Parser, ParserError } from "./parser-types"

export function and<A>(a: Parser<A>): Parser<A>
export function and<A, B>(a: Parser<A>, b: Parser<B>): Parser<A & B>
export function and<A, B, C>(
  a: Parser<A>,
  b: Parser<B>,
  c: Parser<C>,
): Parser<A & B & C>
export function and<A, B, C, D>(
  a: Parser<A>,
  b: Parser<B>,
  c: Parser<C>,
  d: Parser<D>,
): Parser<A & B & C & D>
export function and<A, B, C, D, E>(
  a: Parser<A>,
  b: Parser<B>,
  c: Parser<C>,
  d: Parser<D>,
  e: Parser<E>,
): Parser<A & B & C & D & E>
export function and<A, B, C, D, E, F>(
  a: Parser<A>,
  b: Parser<B>,
  c: Parser<C>,
  d: Parser<D>,
  e: Parser<E>,
  f: Parser<F>,
): Parser<A & B & C & D & E & F>
export function and<A, B, C, D, E, F, G>(
  a: Parser<A>,
  b: Parser<B>,
  c: Parser<C>,
  d: Parser<D>,
  e: Parser<E>,
  f: Parser<F>,
  g: Parser<G>,
): Parser<A & B & C & D & E & F & G>
export function and<A, B, C, D, E, F, G, H>(
  a: Parser<A>,
  b: Parser<B>,
  c: Parser<C>,
  d: Parser<D>,
  e: Parser<E>,
  f: Parser<F>,
  g: Parser<G>,
  h: Parser<H>,
): Parser<A & B & C & D & E & F & G & H>
export function and<A, B, C, D, E, F, G, H, I>(
  a: Parser<A>,
  b: Parser<B>,
  c: Parser<C>,
  d: Parser<D>,
  e: Parser<E>,
  f: Parser<F>,
  g: Parser<G>,
  h: Parser<H>,
  i: Parser<I>,
): Parser<A & B & C & D & E & F & G & H & I>
export function and<A, B, C, D, E, F, G, H, I, J>(
  a: Parser<A>,
  b: Parser<B>,
  c: Parser<C>,
  d: Parser<D>,
  e: Parser<E>,
  f: Parser<F>,
  g: Parser<G>,
  h: Parser<H>,
  i: Parser<I>,
  j: Parser<J>,
): Parser<A & B & C & D & E & F & G & H & I & J>
export function and<A, B, C, D, E, F, G, H, I, J, K>(
  a: Parser<A>,
  b: Parser<B>,
  c: Parser<C>,
  d: Parser<D>,
  e: Parser<E>,
  f: Parser<F>,
  g: Parser<G>,
  h: Parser<H>,
  i: Parser<I>,
  j: Parser<J>,
  k: Parser<K>,
): Parser<A & B & C & D & E & F & G & H & I & J & K>
export function and<A, B, C, D, E, F, G, H, I, J, K, L>(
  a: Parser<A>,
  b: Parser<B>,
  c: Parser<C>,
  d: Parser<D>,
  e: Parser<E>,
  f: Parser<F>,
  g: Parser<G>,
  h: Parser<H>,
  i: Parser<I>,
  j: Parser<J>,
  k: Parser<K>,
  l: Parser<L>,
): Parser<A & B & C & D & E & F & G & H & I & J & K & L>
export function and<A, B, C, D, E, F, G, H, I, J, K, L, M>(
  a: Parser<A>,
  b: Parser<B>,
  c: Parser<C>,
  d: Parser<D>,
  e: Parser<E>,
  f: Parser<F>,
  g: Parser<G>,
  h: Parser<H>,
  i: Parser<I>,
  j: Parser<J>,
  k: Parser<K>,
  l: Parser<L>,
  m: Parser<M>,
): Parser<A & B & C & D & E & F & G & H & I & J & K & L & M>
export function and<A, B, C, D, E, F, G, H, I, J, K, L, M, N>(
  a: Parser<A>,
  b: Parser<B>,
  c: Parser<C>,
  d: Parser<D>,
  e: Parser<E>,
  f: Parser<F>,
  g: Parser<G>,
  h: Parser<H>,
  i: Parser<I>,
  j: Parser<J>,
  k: Parser<K>,
  l: Parser<L>,
  m: Parser<M>,
  n: Parser<N>,
): Parser<A & B & C & D & E & F & G & H & I & J & K & L & M & N>
export function and<A, B, C, D, E, F, G, H, I, J, K, L, M, N, O>(
  a: Parser<A>,
  b: Parser<B>,
  c: Parser<C>,
  d: Parser<D>,
  e: Parser<E>,
  f: Parser<F>,
  g: Parser<G>,
  h: Parser<H>,
  i: Parser<I>,
  j: Parser<J>,
  k: Parser<K>,
  l: Parser<L>,
  m: Parser<M>,
  n: Parser<N>,
  o: Parser<O>,
): Parser<A & B & C & D & E & F & G & H & I & J & K & L & M & N & O>
export function and<A, B, C, D, E, F, G, H, I, J, K, L, M, N, O, P>(
  a: Parser<A>,
  b: Parser<B>,
  c: Parser<C>,
  d: Parser<D>,
  e: Parser<E>,
  f: Parser<F>,
  g: Parser<G>,
  h: Parser<H>,
  i: Parser<I>,
  j: Parser<J>,
  k: Parser<K>,
  l: Parser<L>,
  m: Parser<M>,
  n: Parser<N>,
  o: Parser<O>,
  p: Parser<P>,
): Parser<A & B & C & D & E & F & G & H & I & J & K & L & M & N & O & P>
export function and<A, B, C, D, E, F, G, H, I, J, K, L, M, N, O, P, Q>(
  a: Parser<A>,
  b: Parser<B>,
  c: Parser<C>,
  d: Parser<D>,
  e: Parser<E>,
  f: Parser<F>,
  g: Parser<G>,
  h: Parser<H>,
  i: Parser<I>,
  j: Parser<J>,
  k: Parser<K>,
  l: Parser<L>,
  m: Parser<M>,
  n: Parser<N>,
  o: Parser<O>,
  p: Parser<P>,
  q: Parser<Q>,
): Parser<A & B & C & D & E & F & G & H & I & J & K & L & M & N & O & P & Q>
export function and<A, B, C, D, E, F, G, H, I, J, K, L, M, N, O, P, Q, R>(
  a: Parser<A>,
  b: Parser<B>,
  c: Parser<C>,
  d: Parser<D>,
  e: Parser<E>,
  f: Parser<F>,
  g: Parser<G>,
  h: Parser<H>,
  i: Parser<I>,
  j: Parser<J>,
  k: Parser<K>,
  l: Parser<L>,
  m: Parser<M>,
  n: Parser<N>,
  o: Parser<O>,
  p: Parser<P>,
  q: Parser<Q>,
  r: Parser<R>,
): Parser<A & B & C & D & E & F & G & H & I & J & K & L & M & N & O & P & Q & R>
export function and<A, B, C, D, E, F, G, H, I, J, K, L, M, N, O, P, Q, R, S>(
  a: Parser<A>,
  b: Parser<B>,
  c: Parser<C>,
  d: Parser<D>,
  e: Parser<E>,
  f: Parser<F>,
  g: Parser<G>,
  h: Parser<H>,
  i: Parser<I>,
  j: Parser<J>,
  k: Parser<K>,
  l: Parser<L>,
  m: Parser<M>,
  n: Parser<N>,
  o: Parser<O>,
  p: Parser<P>,
  q: Parser<Q>,
  r: Parser<R>,
  s: Parser<S>,
): Parser<
  A & B & C & D & E & F & G & H & I & J & K & L & M & N & O & P & Q & R & S
>
export function and<A, B, C, D, E, F, G, H, I, J, K, L, M, N, O, P, Q, R, S, T>(
  a: Parser<A>,
  b: Parser<B>,
  c: Parser<C>,
  d: Parser<D>,
  e: Parser<E>,
  f: Parser<F>,
  g: Parser<G>,
  h: Parser<H>,
  i: Parser<I>,
  j: Parser<J>,
  k: Parser<K>,
  l: Parser<L>,
  m: Parser<M>,
  n: Parser<N>,
  o: Parser<O>,
  p: Parser<P>,
  q: Parser<Q>,
  r: Parser<R>,
  s: Parser<S>,
  t: Parser<T>,
): Parser<
  A & B & C & D & E & F & G & H & I & J & K & L & M & N & O & P & Q & R & S & T
>
export function and<
  A,
  B,
  C,
  D,
  E,
  F,
  G,
  H,
  I,
  J,
  K,
  L,
  M,
  N,
  O,
  P,
  Q,
  R,
  S,
  T,
  U,
>(
  a: Parser<A>,
  b: Parser<B>,
  c: Parser<C>,
  d: Parser<D>,
  e: Parser<E>,
  f: Parser<F>,
  g: Parser<G>,
  h: Parser<H>,
  i: Parser<I>,
  j: Parser<J>,
  k: Parser<K>,
  l: Parser<L>,
  m: Parser<M>,
  n: Parser<N>,
  o: Parser<O>,
  p: Parser<P>,
  q: Parser<Q>,
  r: Parser<R>,
  s: Parser<S>,
  t: Parser<T>,
  u: Parser<U>,
): Parser<
  A &
    B &
    C &
    D &
    E &
    F &
    G &
    H &
    I &
    J &
    K &
    L &
    M &
    N &
    O &
    P &
    Q &
    R &
    S &
    T &
    U
>
export function and<
  A,
  B,
  C,
  D,
  E,
  F,
  G,
  H,
  I,
  J,
  K,
  L,
  M,
  N,
  O,
  P,
  Q,
  R,
  S,
  T,
  U,
  V,
>(
  a: Parser<A>,
  b: Parser<B>,
  c: Parser<C>,
  d: Parser<D>,
  e: Parser<E>,
  f: Parser<F>,
  g: Parser<G>,
  h: Parser<H>,
  i: Parser<I>,
  j: Parser<J>,
  k: Parser<K>,
  l: Parser<L>,
  m: Parser<M>,
  n: Parser<N>,
  o: Parser<O>,
  p: Parser<P>,
  q: Parser<Q>,
  r: Parser<R>,
  s: Parser<S>,
  t: Parser<T>,
  u: Parser<U>,
  v: Parser<V>,
): Parser<
  A &
    B &
    C &
    D &
    E &
    F &
    G &
    H &
    I &
    J &
    K &
    L &
    M &
    N &
    O &
    P &
    Q &
    R &
    S &
    T &
    U &
    V
>
export function and<
  A,
  B,
  C,
  D,
  E,
  F,
  G,
  H,
  I,
  J,
  K,
  L,
  M,
  N,
  O,
  P,
  Q,
  R,
  S,
  T,
  U,
  V,
  W,
>(
  a: Parser<A>,
  b: Parser<B>,
  c: Parser<C>,
  d: Parser<D>,
  e: Parser<E>,
  f: Parser<F>,
  g: Parser<G>,
  h: Parser<H>,
  i: Parser<I>,
  j: Parser<J>,
  k: Parser<K>,
  l: Parser<L>,
  m: Parser<M>,
  n: Parser<N>,
  o: Parser<O>,
  p: Parser<P>,
  q: Parser<Q>,
  r: Parser<R>,
  s: Parser<S>,
  t: Parser<T>,
  u: Parser<U>,
  v: Parser<V>,
  w: Parser<W>,
): Parser<
  A &
    B &
    C &
    D &
    E &
    F &
    G &
    H &
    I &
    J &
    K &
    L &
    M &
    N &
    O &
    P &
    Q &
    R &
    S &
    T &
    U &
    V &
    W
>
export function and<
  A,
  B,
  C,
  D,
  E,
  F,
  G,
  H,
  I,
  J,
  K,
  L,
  M,
  N,
  O,
  P,
  Q,
  R,
  S,
  T,
  U,
  V,
  W,
  X,
>(
  a: Parser<A>,
  b: Parser<B>,
  c: Parser<C>,
  d: Parser<D>,
  e: Parser<E>,
  f: Parser<F>,
  g: Parser<G>,
  h: Parser<H>,
  i: Parser<I>,
  j: Parser<J>,
  k: Parser<K>,
  l: Parser<L>,
  m: Parser<M>,
  n: Parser<N>,
  o: Parser<O>,
  p: Parser<P>,
  q: Parser<Q>,
  r: Parser<R>,
  s: Parser<S>,
  t: Parser<T>,
  u: Parser<U>,
  v: Parser<V>,
  w: Parser<W>,
  x: Parser<X>,
): Parser<
  A &
    B &
    C &
    D &
    E &
    F &
    G &
    H &
    I &
    J &
    K &
    L &
    M &
    N &
    O &
    P &
    Q &
    R &
    S &
    T &
    U &
    V &
    W &
    X
>
export function and<
  A,
  B,
  C,
  D,
  E,
  F,
  G,
  H,
  I,
  J,
  K,
  L,
  M,
  N,
  O,
  P,
  Q,
  R,
  S,
  T,
  U,
  V,
  W,
  X,
  Y,
>(
  a: Parser<A>,
  b: Parser<B>,
  c: Parser<C>,
  d: Parser<D>,
  e: Parser<E>,
  f: Parser<F>,
  g: Parser<G>,
  h: Parser<H>,
  i: Parser<I>,
  j: Parser<J>,
  k: Parser<K>,
  l: Parser<L>,
  m: Parser<M>,
  n: Parser<N>,
  o: Parser<O>,
  p: Parser<P>,
  q: Parser<Q>,
  r: Parser<R>,
  s: Parser<S>,
  t: Parser<T>,
  u: Parser<U>,
  v: Parser<V>,
  w: Parser<W>,
  x: Parser<X>,
  y: Parser<Y>,
): Parser<
  A &
    B &
    C &
    D &
    E &
    F &
    G &
    H &
    I &
    J &
    K &
    L &
    M &
    N &
    O &
    P &
    Q &
    R &
    S &
    T &
    U &
    V &
    W &
    X &
    Y
>
export function and<
  A,
  B,
  C,
  D,
  E,
  F,
  G,
  H,
  I,
  J,
  K,
  L,
  M,
  N,
  O,
  P,
  Q,
  R,
  S,
  T,
  U,
  V,
  W,
  X,
  Y,
  Z,
>(
  a: Parser<A>,
  b: Parser<B>,
  c: Parser<C>,
  d: Parser<D>,
  e: Parser<E>,
  f: Parser<F>,
  g: Parser<G>,
  h: Parser<H>,
  i: Parser<I>,
  j: Parser<J>,
  k: Parser<K>,
  l: Parser<L>,
  m: Parser<M>,
  n: Parser<N>,
  o: Parser<O>,
  p: Parser<P>,
  q: Parser<Q>,
  r: Parser<R>,
  s: Parser<S>,
  t: Parser<T>,
  u: Parser<U>,
  v: Parser<V>,
  w: Parser<W>,
  x: Parser<X>,
  y: Parser<Y>,
  z: Parser<Z>,
): Parser<
  A &
    B &
    C &
    D &
    E &
    F &
    G &
    H &
    I &
    J &
    K &
    L &
    M &
    N &
    O &
    P &
    Q &
    R &
    S &
    T &
    U &
    V &
    W &
    X &
    Y &
    Z
>
export function and(...parsers: Parser<unknown>[]): Parser<unknown> {
  return {
    parse(input) {
      const errors: ParserError[] = []

      for (let i = 0; i < parsers.length; i++) {
        const result = parsers[i]!.parse(input)
        switch (result.t) {
          case "ok": {
            continue
          }
          case "err": {
            errors.push(...result.error)
            break
          }
        }
      }

      if (errors.length === 0) {
        return ok(input)
      }

      return err(errors)
    },
  }
}
