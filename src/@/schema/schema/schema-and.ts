import { Err, Ok } from '../../result/result'
import { ParseErrorEntry } from './parse-error-entry'
import { isSchema, type Schema } from './schema'

export type SchemaAnd<T> = Schema<T> & {
  t: 'and'
}

export function and<A>(a: Schema<A>): SchemaAnd<A>
export function and<A, B>(a: Schema<A>, b: Schema<B>): SchemaAnd<A & B>
export function and<A, B, C>(a: Schema<A>, b: Schema<B>, c: Schema<C>): SchemaAnd<A & B & C>
export function and<A, B, C, D>(a: Schema<A>, b: Schema<B>, c: Schema<C>, d: Schema<D>): SchemaAnd<A & B & C & D>
export function and<A, B, C, D, E>(
  a: Schema<A>,
  b: Schema<B>,
  c: Schema<C>,
  d: Schema<D>,
  e: Schema<E>,
): SchemaAnd<A & B & C & D & E>
export function and<A, B, C, D, E, F>(
  a: Schema<A>,
  b: Schema<B>,
  c: Schema<C>,
  d: Schema<D>,
  e: Schema<E>,
  f: Schema<F>,
): SchemaAnd<A & B & C & D & E & F>
export function and<A, B, C, D, E, F, G>(
  a: Schema<A>,
  b: Schema<B>,
  c: Schema<C>,
  d: Schema<D>,
  e: Schema<E>,
  f: Schema<F>,
  g: Schema<G>,
): SchemaAnd<A & B & C & D & E & F & G>
export function and<A, B, C, D, E, F, G, H>(
  a: Schema<A>,
  b: Schema<B>,
  c: Schema<C>,
  d: Schema<D>,
  e: Schema<E>,
  f: Schema<F>,
  g: Schema<G>,
  h: Schema<H>,
): SchemaAnd<A & B & C & D & E & F & G & H>
export function and<A, B, C, D, E, F, G, H, I>(
  a: Schema<A>,
  b: Schema<B>,
  c: Schema<C>,
  d: Schema<D>,
  e: Schema<E>,
  f: Schema<F>,
  g: Schema<G>,
  h: Schema<H>,
  i: Schema<I>,
): SchemaAnd<A & B & C & D & E & F & G & H & I>
export function and<A, B, C, D, E, F, G, H, I, J>(
  a: Schema<A>,
  b: Schema<B>,
  c: Schema<C>,
  d: Schema<D>,
  e: Schema<E>,
  f: Schema<F>,
  g: Schema<G>,
  h: Schema<H>,
  i: Schema<I>,
  j: Schema<J>,
): SchemaAnd<A & B & C & D & E & F & G & H & I & J>
export function and<A, B, C, D, E, F, G, H, I, J, K>(
  a: Schema<A>,
  b: Schema<B>,
  c: Schema<C>,
  d: Schema<D>,
  e: Schema<E>,
  f: Schema<F>,
  g: Schema<G>,
  h: Schema<H>,
  i: Schema<I>,
  j: Schema<J>,
  k: Schema<K>,
): SchemaAnd<A & B & C & D & E & F & G & H & I & J & K>
export function and<A, B, C, D, E, F, G, H, I, J, K, L>(
  a: Schema<A>,
  b: Schema<B>,
  c: Schema<C>,
  d: Schema<D>,
  e: Schema<E>,
  f: Schema<F>,
  g: Schema<G>,
  h: Schema<H>,
  i: Schema<I>,
  j: Schema<J>,
  k: Schema<K>,
  l: Schema<L>,
): SchemaAnd<A & B & C & D & E & F & G & H & I & J & K & L>
export function and<A, B, C, D, E, F, G, H, I, J, K, L, M>(
  a: Schema<A>,
  b: Schema<B>,
  c: Schema<C>,
  d: Schema<D>,
  e: Schema<E>,
  f: Schema<F>,
  g: Schema<G>,
  h: Schema<H>,
  i: Schema<I>,
  j: Schema<J>,
  k: Schema<K>,
  l: Schema<L>,
  m: Schema<M>,
): SchemaAnd<A & B & C & D & E & F & G & H & I & J & K & L & M>
export function and<A, B, C, D, E, F, G, H, I, J, K, L, M, N>(
  a: Schema<A>,
  b: Schema<B>,
  c: Schema<C>,
  d: Schema<D>,
  e: Schema<E>,
  f: Schema<F>,
  g: Schema<G>,
  h: Schema<H>,
  i: Schema<I>,
  j: Schema<J>,
  k: Schema<K>,
  l: Schema<L>,
  m: Schema<M>,
  n: Schema<N>,
): SchemaAnd<A & B & C & D & E & F & G & H & I & J & K & L & M & N>
export function and<A, B, C, D, E, F, G, H, I, J, K, L, M, N, O>(
  a: Schema<A>,
  b: Schema<B>,
  c: Schema<C>,
  d: Schema<D>,
  e: Schema<E>,
  f: Schema<F>,
  g: Schema<G>,
  h: Schema<H>,
  i: Schema<I>,
  j: Schema<J>,
  k: Schema<K>,
  l: Schema<L>,
  m: Schema<M>,
  n: Schema<N>,
  o: Schema<O>,
): SchemaAnd<A & B & C & D & E & F & G & H & I & J & K & L & M & N & O>
export function and<A, B, C, D, E, F, G, H, I, J, K, L, M, N, O, P>(
  a: Schema<A>,
  b: Schema<B>,
  c: Schema<C>,
  d: Schema<D>,
  e: Schema<E>,
  f: Schema<F>,
  g: Schema<G>,
  h: Schema<H>,
  i: Schema<I>,
  j: Schema<J>,
  k: Schema<K>,
  l: Schema<L>,
  m: Schema<M>,
  n: Schema<N>,
  o: Schema<O>,
  p: Schema<P>,
): SchemaAnd<A & B & C & D & E & F & G & H & I & J & K & L & M & N & O & P>
export function and<A, B, C, D, E, F, G, H, I, J, K, L, M, N, O, P, Q>(
  a: Schema<A>,
  b: Schema<B>,
  c: Schema<C>,
  d: Schema<D>,
  e: Schema<E>,
  f: Schema<F>,
  g: Schema<G>,
  h: Schema<H>,
  i: Schema<I>,
  j: Schema<J>,
  k: Schema<K>,
  l: Schema<L>,
  m: Schema<M>,
  n: Schema<N>,
  o: Schema<O>,
  p: Schema<P>,
  q: Schema<Q>,
): SchemaAnd<A & B & C & D & E & F & G & H & I & J & K & L & M & N & O & P & Q>
export function and<A, B, C, D, E, F, G, H, I, J, K, L, M, N, O, P, Q, R>(
  a: Schema<A>,
  b: Schema<B>,
  c: Schema<C>,
  d: Schema<D>,
  e: Schema<E>,
  f: Schema<F>,
  g: Schema<G>,
  h: Schema<H>,
  i: Schema<I>,
  j: Schema<J>,
  k: Schema<K>,
  l: Schema<L>,
  m: Schema<M>,
  n: Schema<N>,
  o: Schema<O>,
  p: Schema<P>,
  q: Schema<Q>,
  r: Schema<R>,
): SchemaAnd<A & B & C & D & E & F & G & H & I & J & K & L & M & N & O & P & Q & R>
export function and<A, B, C, D, E, F, G, H, I, J, K, L, M, N, O, P, Q, R, S>(
  a: Schema<A>,
  b: Schema<B>,
  c: Schema<C>,
  d: Schema<D>,
  e: Schema<E>,
  f: Schema<F>,
  g: Schema<G>,
  h: Schema<H>,
  i: Schema<I>,
  j: Schema<J>,
  k: Schema<K>,
  l: Schema<L>,
  m: Schema<M>,
  n: Schema<N>,
  o: Schema<O>,
  p: Schema<P>,
  q: Schema<Q>,
  r: Schema<R>,
  s: Schema<S>,
): SchemaAnd<A & B & C & D & E & F & G & H & I & J & K & L & M & N & O & P & Q & R & S>
export function and<A, B, C, D, E, F, G, H, I, J, K, L, M, N, O, P, Q, R, S, T>(
  a: Schema<A>,
  b: Schema<B>,
  c: Schema<C>,
  d: Schema<D>,
  e: Schema<E>,
  f: Schema<F>,
  g: Schema<G>,
  h: Schema<H>,
  i: Schema<I>,
  j: Schema<J>,
  k: Schema<K>,
  l: Schema<L>,
  m: Schema<M>,
  n: Schema<N>,
  o: Schema<O>,
  p: Schema<P>,
  q: Schema<Q>,
  r: Schema<R>,
  s: Schema<S>,
  t: Schema<T>,
): SchemaAnd<A & B & C & D & E & F & G & H & I & J & K & L & M & N & O & P & Q & R & S & T>
export function and<A, B, C, D, E, F, G, H, I, J, K, L, M, N, O, P, Q, R, S, T, U>(
  a: Schema<A>,
  b: Schema<B>,
  c: Schema<C>,
  d: Schema<D>,
  e: Schema<E>,
  f: Schema<F>,
  g: Schema<G>,
  h: Schema<H>,
  i: Schema<I>,
  j: Schema<J>,
  k: Schema<K>,
  l: Schema<L>,
  m: Schema<M>,
  n: Schema<N>,
  o: Schema<O>,
  p: Schema<P>,
  q: Schema<Q>,
  r: Schema<R>,
  s: Schema<S>,
  t: Schema<T>,
  u: Schema<U>,
): SchemaAnd<A & B & C & D & E & F & G & H & I & J & K & L & M & N & O & P & Q & R & S & T & U>
export function and<A, B, C, D, E, F, G, H, I, J, K, L, M, N, O, P, Q, R, S, T, U, V>(
  a: Schema<A>,
  b: Schema<B>,
  c: Schema<C>,
  d: Schema<D>,
  e: Schema<E>,
  f: Schema<F>,
  g: Schema<G>,
  h: Schema<H>,
  i: Schema<I>,
  j: Schema<J>,
  k: Schema<K>,
  l: Schema<L>,
  m: Schema<M>,
  n: Schema<N>,
  o: Schema<O>,
  p: Schema<P>,
  q: Schema<Q>,
  r: Schema<R>,
  s: Schema<S>,
  t: Schema<T>,
  u: Schema<U>,
  v: Schema<V>,
): SchemaAnd<A & B & C & D & E & F & G & H & I & J & K & L & M & N & O & P & Q & R & S & T & U & V>
export function and<A, B, C, D, E, F, G, H, I, J, K, L, M, N, O, P, Q, R, S, T, U, V, W>(
  a: Schema<A>,
  b: Schema<B>,
  c: Schema<C>,
  d: Schema<D>,
  e: Schema<E>,
  f: Schema<F>,
  g: Schema<G>,
  h: Schema<H>,
  i: Schema<I>,
  j: Schema<J>,
  k: Schema<K>,
  l: Schema<L>,
  m: Schema<M>,
  n: Schema<N>,
  o: Schema<O>,
  p: Schema<P>,
  q: Schema<Q>,
  r: Schema<R>,
  s: Schema<S>,
  t: Schema<T>,
  u: Schema<U>,
  v: Schema<V>,
  w: Schema<W>,
): SchemaAnd<A & B & C & D & E & F & G & H & I & J & K & L & M & N & O & P & Q & R & S & T & U & V & W>
export function and<A, B, C, D, E, F, G, H, I, J, K, L, M, N, O, P, Q, R, S, T, U, V, W, X>(
  a: Schema<A>,
  b: Schema<B>,
  c: Schema<C>,
  d: Schema<D>,
  e: Schema<E>,
  f: Schema<F>,
  g: Schema<G>,
  h: Schema<H>,
  i: Schema<I>,
  j: Schema<J>,
  k: Schema<K>,
  l: Schema<L>,
  m: Schema<M>,
  n: Schema<N>,
  o: Schema<O>,
  p: Schema<P>,
  q: Schema<Q>,
  r: Schema<R>,
  s: Schema<S>,
  t: Schema<T>,
  u: Schema<U>,
  v: Schema<V>,
  w: Schema<W>,
  x: Schema<X>,
): SchemaAnd<A & B & C & D & E & F & G & H & I & J & K & L & M & N & O & P & Q & R & S & T & U & V & W & X>
export function and<A, B, C, D, E, F, G, H, I, J, K, L, M, N, O, P, Q, R, S, T, U, V, W, X, Y>(
  a: Schema<A>,
  b: Schema<B>,
  c: Schema<C>,
  d: Schema<D>,
  e: Schema<E>,
  f: Schema<F>,
  g: Schema<G>,
  h: Schema<H>,
  i: Schema<I>,
  j: Schema<J>,
  k: Schema<K>,
  l: Schema<L>,
  m: Schema<M>,
  n: Schema<N>,
  o: Schema<O>,
  p: Schema<P>,
  q: Schema<Q>,
  r: Schema<R>,
  s: Schema<S>,
  t: Schema<T>,
  u: Schema<U>,
  v: Schema<V>,
  w: Schema<W>,
  x: Schema<X>,
  y: Schema<Y>,
): SchemaAnd<A & B & C & D & E & F & G & H & I & J & K & L & M & N & O & P & Q & R & S & T & U & V & W & X & Y>
export function and<A, B, C, D, E, F, G, H, I, J, K, L, M, N, O, P, Q, R, S, T, U, V, W, X, Y, Z>(
  a: Schema<A>,
  b: Schema<B>,
  c: Schema<C>,
  d: Schema<D>,
  e: Schema<E>,
  f: Schema<F>,
  g: Schema<G>,
  h: Schema<H>,
  i: Schema<I>,
  j: Schema<J>,
  k: Schema<K>,
  l: Schema<L>,
  m: Schema<M>,
  n: Schema<N>,
  o: Schema<O>,
  p: Schema<P>,
  q: Schema<Q>,
  r: Schema<R>,
  s: Schema<S>,
  t: Schema<T>,
  u: Schema<U>,
  v: Schema<V>,
  w: Schema<W>,
  x: Schema<X>,
  y: Schema<Y>,
  z: Schema<Z>,
): SchemaAnd<A & B & C & D & E & F & G & H & I & J & K & L & M & N & O & P & Q & R & S & T & U & V & W & X & Y & Z>
export function and(...schemas: Schema<unknown>[]): SchemaAnd<unknown> {
  return {
    t: 'and',
    parse(input) {
      const errors: ParseErrorEntry[] = []

      for (let i = 0; i < schemas.length; i++) {
        const result = schemas[i]!.parse(input)
        switch (result.t) {
          case 'ok': {
            continue
          }
          case 'err': {
            errors.push(...result.error.entries)
            break
          }
        }
      }

      if (errors.length === 0) {
        return Ok(input)
      }

      return Err({ entries: errors })
    },
  }
}

export const isAnd = (input: unknown): input is SchemaAnd<unknown> => {
  return isSchema(input) && input.t === 'and'
}
