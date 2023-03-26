import * as Rx from "rxjs"
import { p } from "./pipe"
import { t } from "./utils"

export type Sub<Msg> = Rx.Observable<Msg>

export const map =
  <A, Msg>(f: (a: A) => Msg) =>
    (sub: Sub<A>): Sub<Msg> => {
      return sub.pipe(Rx.map(f))
    }

const chain =
  <Msg, A>(f: (a: A) => Sub<Msg>) =>
    (sub: Sub<A>): Sub<Msg> => {
      return sub.pipe(Rx.mergeMap(f))
    }

export const batch = <Msg>(arr: Sub<Msg>[]): Sub<Msg> => {
  return Rx.merge(...arr)
}

export const None: Sub<never> = Rx.EMPTY

type Unsubscribe = () => void

export const create = <Msg>(
  subscribe: (emit: (msg: Msg) => void) => Unsubscribe,
): Sub<Msg> => {
  return new Rx.Observable<Msg>((subscriber) => {
    const unsubscribe = subscribe((msg) => {
      subscriber.next(msg)
    })

    return () => {
      unsubscribe()
    }
  })
}

export const tag = <Tag extends string, Msg>(
  tagName: Tag,
  sub: Sub<Msg>,
): Sub<[Tag, Msg]> => {
  return p(sub, Sub.map(t(tagName)))
}

const of = <T>(msg: T): Sub<T> => {
  return Rx.of(msg)
}

export const Sub = {
  map,
  batch,
  create,
  of,
  None,
  tag,
  chain,
}
