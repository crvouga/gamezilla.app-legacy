import type { IO } from './io'

export type Eff<Msg = never> = (dispatch: (msg: Msg) => void) => void

const of = <Msg>(msg: Msg): Eff<Msg> => {
  const eff: Eff<Msg> = (dispatch) => {
    dispatch(msg)
  }
  return eff
}

const map = <A, B>(eff: Eff<A> | null | undefined, mapper: (a: A) => B): Eff<B> => {
  if (!eff) {
    return None
  }
  return (dispatch) => {
    eff((a) => {
      dispatch(mapper(a))
    })
  }
}

const chain =
  <A, B>(mapper: (a: A) => Eff<B>) =>
  (eff: Eff<A>): Eff<B> => {
    return (dispatch) => {
      eff((a) => {
        mapper(a)((b) => {
          dispatch(b)
        })
      })
    }
  }

const tag = <Tag extends string, Msg>(tagName: Tag, eff: Eff<Msg> | undefined | null): Eff<{ t: Tag; c: Msg }> => {
  if (!eff) {
    return None
  }
  return map(eff, (msg) => ({ t: tagName, c: msg }))
}

const batch = <Msg>(...effLists: ((Eff<Msg> | undefined | null)[] | Eff<Msg> | null | undefined)[]): Eff<Msg> => {
  return (dispatch) => {
    for (const effList of effLists) {
      if (Array.isArray(effList)) {
        for (const eff of effList) {
          if (eff) {
            eff(dispatch)
          }
        }
      } else {
        if (effList) {
          effList(dispatch)
        }
      }
    }
  }
}

const None: Eff = () => {
  // do nothing
}

const perform =
  <A, Msg>(f: (a: A) => Msg) =>
  (task: IO<A>): Eff<Msg> => {
    return async (dispatch) => {
      const value = await task()
      dispatch(f(value))
    }
  }

/**
 * An `Eff` represents a side effect that can be performed by the runtime.
 */
export const Eff = {
  None,
  perform,
  batch,
  tag,
  chain,
  map,
  of
}
