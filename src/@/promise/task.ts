import { Result } from '../core/result'

export type Task<TErr, TVal> = Promise<Result<TErr, TVal>>

const Ok = async <TErr, TVal>(value: TVal): Task<TErr, TVal> => Result.Ok(value)

function pipe<A, B, E>(task: Task<E, A>, f1: (a: A) => Task<E, B>): Promise<Task<E, B>>
function pipe<A, B, C, E>(task: Task<E, A>, f1: (a: A) => Task<E, B>, f2: (b: B) => Task<E, C>): Promise<Task<E, C>>
function pipe<A, B, C, D, E>(
  task: Task<E, A>,
  f1: (a: A) => Task<E, B>,
  f2: (b: B) => Task<E, C>,
  f3: (c: C) => Task<E, D>
): Promise<Task<E, D>>
function pipe<A, B, C, D, E, F>(
  task: Task<E, A>,
  f1: (a: A) => Task<E, B>,
  f2: (b: B) => Task<E, C>,
  f3: (c: C) => Task<E, D>,
  f4: (d: D) => Task<E, F>
): Promise<Task<E, F>>
function pipe<A, B, C, D, E, F, G>(
  task: Task<E, A>,
  f1: (a: A) => Task<E, B>,
  f2: (b: B) => Task<E, C>,
  f3: (c: C) => Task<E, D>,
  f4: (d: D) => Task<E, F>,
  f5: (e: F) => Task<E, G>
): Promise<Task<E, G>>
function pipe<A, B, C, D, E, F, G, H>(
  task: Task<E, A>,
  f1: (a: A) => Task<E, B>,
  f2: (b: B) => Task<E, C>,
  f3: (c: C) => Task<E, D>,
  f4: (d: D) => Task<E, F>,
  f5: (e: F) => Task<E, G>,
  f6: (f: G) => Task<E, H>
): Promise<Task<E, H>>
function pipe<A, B, C, D, E, F, G, H, I>(
  task: Task<E, A>,
  f1: (a: A) => Task<E, B>,
  f2: (b: B) => Task<E, C>,
  f3: (c: C) => Task<E, D>,
  f4: (d: D) => Task<E, F>,
  f5: (e: F) => Task<E, G>,
  f6: (f: G) => Task<E, H>,
  f7: (g: H) => Task<E, I>
): Promise<Task<E, I>>
function pipe<A, B, C, D, E, F, G, H, I, J>(
  task: Task<E, A>,
  f1: (a: A) => Task<E, B>,
  f2: (b: B) => Task<E, C>,
  f3: (c: C) => Task<E, D>,
  f4: (d: D) => Task<E, F>,
  f5: (e: F) => Task<E, G>,
  f6: (f: G) => Task<E, H>,
  f7: (g: H) => Task<E, I>,
  f8: (h: I) => Task<E, J>
): Promise<Task<E, J>>
async function pipe<E, A>(task: Task<E, A>, ...functions: ((a: A) => Task<E, A>)[]): Promise<Task<E, A>> {
  let currentTask = await task

  for (const fn of functions) {
    if (currentTask.t === 'err') {
      return currentTask
    }
    currentTask = await fn(currentTask.value)
  }

  return currentTask
}
export const Task = {
  pipe,
  Ok
}
