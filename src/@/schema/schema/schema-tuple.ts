import { Err, Ok } from '../../result/result'
import { isSchema, type Schema } from './schema-types'
import { ParseErrorEntry } from './parse-error-entry'

export type SchemaTuple<T> = Schema<T> & {
  t: 'tuple'
}

export function tuple<A>(a: Schema<A>): SchemaTuple<[A]>
export function tuple<A, B>(a: Schema<A>, b: Schema<B>): SchemaTuple<[A, B]>
export function tuple<A, B, C>(a: Schema<A>, b: Schema<B>, c: Schema<C>): SchemaTuple<[A, B, C]>
export function tuple<A, B, C, D>(a: Schema<A>, b: Schema<B>, c: Schema<C>, d: Schema<D>): SchemaTuple<[A, B, C, D]>
export function tuple<A, B, C, D, E>(
  a: Schema<A>,
  b: Schema<B>,
  c: Schema<C>,
  d: Schema<D>,
  e: Schema<E>,
): SchemaTuple<[A, B, C, D, E]>
export function tuple<A, B, C, D, E, F>(
  a: Schema<A>,
  b: Schema<B>,
  c: Schema<C>,
  d: Schema<D>,
  e: Schema<E>,
  f: Schema<F>,
): SchemaTuple<[A, B, C, D, E, F]>
export function tuple<A, B, C, D, E, F, G>(
  a: Schema<A>,
  b: Schema<B>,
  c: Schema<C>,
  d: Schema<D>,
  e: Schema<E>,
  f: Schema<F>,
  g: Schema<G>,
): SchemaTuple<[A, B, C, D, E, F, G]>
export function tuple<A, B, C, D, E, F, G, H>(
  a: Schema<A>,
  b: Schema<B>,
  c: Schema<C>,
  d: Schema<D>,
  e: Schema<E>,
  f: Schema<F>,
  g: Schema<G>,
  h: Schema<H>,
): SchemaTuple<[A, B, C, D, E, F, G, H]>
export function tuple<A, B, C, D, E, F, G, H, I>(
  a: Schema<A>,
  b: Schema<B>,
  c: Schema<C>,
  d: Schema<D>,
  e: Schema<E>,
  f: Schema<F>,
  g: Schema<G>,
  h: Schema<H>,
  i: Schema<I>,
): SchemaTuple<[A, B, C, D, E, F, G, H, I]>
export function tuple<A, B, C, D, E, F, G, H, I, J>(
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
): SchemaTuple<[A, B, C, D, E, F, G, H, I, J]>
export function tuple<A, B, C, D, E, F, G, H, I, J, K>(
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
): SchemaTuple<[A, B, C, D, E, F, G, H, I, J, K]>
export function tuple<A, B, C, D, E, F, G, H, I, J, K, L>(
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
): SchemaTuple<[A, B, C, D, E, F, G, H, I, J, K, L]>
export function tuple<A, B, C, D, E, F, G, H, I, J, K, L, M>(
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
): SchemaTuple<[A, B, C, D, E, F, G, H, I, J, K, L, M]>
export function tuple<A, B, C, D, E, F, G, H, I, J, K, L, M, N>(
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
): SchemaTuple<[A, B, C, D, E, F, G, H, I, J, K, L, M, N]>
export function tuple<A, B, C, D, E, F, G, H, I, J, K, L, M, N, O>(
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
): SchemaTuple<[A, B, C, D, E, F, G, H, I, J, K, L, M, N, O]>
export function tuple<A, B, C, D, E, F, G, H, I, J, K, L, M, N, O, P>(
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
): SchemaTuple<[A, B, C, D, E, F, G, H, I, J, K, L, M, N, O, P]>
export function tuple<A, B, C, D, E, F, G, H, I, J, K, L, M, N, O, P, Q>(
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
): SchemaTuple<[A, B, C, D, E, F, G, H, I, J, K, L, M, N, O, P, Q]>
export function tuple<A, B, C, D, E, F, G, H, I, J, K, L, M, N, O, P, Q, R>(
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
): SchemaTuple<[A, B, C, D, E, F, G, H, I, J, K, L, M, N, O, P, Q, R]>
export function tuple<A, B, C, D, E, F, G, H, I, J, K, L, M, N, O, P, Q, R, S>(
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
): SchemaTuple<[A, B, C, D, E, F, G, H, I, J, K, L, M, N, O, P, Q, R, S]>
export function tuple<A, B, C, D, E, F, G, H, I, J, K, L, M, N, O, P, Q, R, S, T>(
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
): SchemaTuple<[A, B, C, D, E, F, G, H, I, J, K, L, M, N, O, P, Q, R, S, T]>
export function tuple<A, B, C, D, E, F, G, H, I, J, K, L, M, N, O, P, Q, R, S, T, U>(
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
): SchemaTuple<[A, B, C, D, E, F, G, H, I, J, K, L, M, N, O, P, Q, R, S, T, U]>
export function tuple<A, B, C, D, E, F, G, H, I, J, K, L, M, N, O, P, Q, R, S, T, U, V>(
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
): SchemaTuple<[A, B, C, D, E, F, G, H, I, J, K, L, M, N, O, P, Q, R, S, T, U, V]>
export function tuple<A, B, C, D, E, F, G, H, I, J, K, L, M, N, O, P, Q, R, S, T, U, V, W>(
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
): SchemaTuple<[A, B, C, D, E, F, G, H, I, J, K, L, M, N, O, P, Q, R, S, T, U, V, W]>
export function tuple<A, B, C, D, E, F, G, H, I, J, K, L, M, N, O, P, Q, R, S, T, U, V, W, X>(
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
): SchemaTuple<[A, B, C, D, E, F, G, H, I, J, K, L, M, N, O, P, Q, R, S, T, U, V, W, X]>
export function tuple<A, B, C, D, E, F, G, H, I, J, K, L, M, N, O, P, Q, R, S, T, U, V, W, X, Y>(
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
): SchemaTuple<[A, B, C, D, E, F, G, H, I, J, K, L, M, N, O, P, Q, R, S, T, U, V, W, X, Y]>
export function tuple<A, B, C, D, E, F, G, H, I, J, K, L, M, N, O, P, Q, R, S, T, U, V, W, X, Y, Z>(
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
): SchemaTuple<[A, B, C, D, E, F, G, H, I, J, K, L, M, N, O, P, Q, R, S, T, U, V, W, X, Y, Z]>
export function tuple(...schemas: Schema<unknown>[]): SchemaTuple<unknown> {
  return {
    t: 'tuple',
    parse(input) {
      const errors: ParseErrorEntry[] = []
      const tuple: any[] = []

      for (let i = 0; i < schemas.length; i++) {
        const result = schemas[i]!.parse(input)
        switch (result.t) {
          case 'ok': {
            tuple.push(result.value)
            continue
          }
          case 'err': {
            errors.push(...result.error.entries)
            break
          }
        }
      }

      if (errors.length === 0) {
        return Ok(tuple)
      }

      return Err({ entries: errors })
    },
  }
}

export const isTuple = (input: unknown): input is SchemaTuple<unknown> => {
  return isSchema(input) && input.t === 'tuple'
}
