export type Task<T> = () => Promise<T>

export const of =
  <T>(value: T) =>
  async () => {
    return value
  }

export const map =
  <A, B>(mapper: (value: A) => B) =>
  (task: Task<A>): Task<B> =>
  async () => {
    return mapper(await task())
  }

export const chain =
  <A, B>(mapper: (a: A) => Task<B>) =>
  (taskA: Task<A>): Task<B> =>
  async () => {
    const a = await taskA()

    const taskB = mapper(a)

    return await taskB()
  }

export const timeout =
  <T>(milliseconds: number, value: T): Task<T> =>
  async () => {
    await new Promise((resolve) => setTimeout(resolve, milliseconds))
    return value
  }

export const Task = {
  map,
  chain,
  timeout,
  of,
}
