export type IO<T> = () => T

export const of =
  <T>(value: T): IO<T> =>
  () => {
    return value
  }

export const map =
  <A, B>(mapper: (value: A) => B) =>
  (ioA: IO<A>): IO<B> =>
  () => {
    return mapper(ioA())
  }

export const chain =
  <A, B>(mapper: (a: A) => IO<B>) =>
  (ioA: IO<A>): IO<B> =>
  () => {
    const a = ioA()

    const ioB = mapper(a)

    const b = ioB()

    return b
  }
