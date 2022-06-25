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

export const timeout =
  <T>(milliseconds: number, value: T): Task<T> =>
  async () => {
    await new Promise((resolve) => setTimeout(resolve, milliseconds))
    return value
  }
