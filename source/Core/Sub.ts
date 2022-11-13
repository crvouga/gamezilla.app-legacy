import * as Rx from "rxjs"

export interface Sub<Msg> extends Rx.Observable<Msg> { }

export const map =
  <A, Msg>(f: (a: A) => Msg) =>
    (sub: Sub<A>): Sub<Msg> => {
      return sub.pipe(Rx.map(f))
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

export const Sub = {
  map,
  batch,
  create,
  None,
}