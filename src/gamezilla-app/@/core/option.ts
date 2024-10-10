import type { Result } from './result'

export type Option<T> = Some<T> | None

export type Some<T> = { type: 'Some'; value: T }

export const Some = <T>(value: T): Option<T> => ({ type: 'Some', value })

export type None = { type: 'none' }

export const None: None = { type: 'none' }

const map =
  <A, B>(mapper: (value: A) => B) =>
  (option: Option<A>): Option<B> => {
    switch (option.type) {
      case 'none':
        return None

      case 'Some':
        return Some(mapper(option.value))
    }
  }

const fold =
  <A, B>(onNone: () => B, onSome: (value: A) => B) =>
  (option: Option<A>): B => {
    switch (option.type) {
      case 'none':
        return onNone()

      case 'Some':
        return onSome(option.value)
    }
  }

const unwrapOr =
  <T>(fallback: T) =>
  (option: Option<T>): T => {
    switch (option.type) {
      case 'none':
        return fallback

      case 'Some':
        return option.value
    }
  }

const fromNullable = <T>(value: T | null | undefined): Option<T> => {
  if (value === null) {
    return None
  }

  if (value === undefined) {
    return None
  }

  return Some(value)
}

const fromResult = <TErr, TOk>(result: Result<TErr, TOk>): Option<TOk> => {
  switch (result.t) {
    case 'err':
      return None

    case 'ok':
      return Some(result.value)
  }
}

export const Option = {
  Some,
  None,
  map,
  fold,
  unwrapOr,
  fromNullable,
  fromResult
}
