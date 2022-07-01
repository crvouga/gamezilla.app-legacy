import * as Rx from "rxjs";

export type Sub<Msg> = Rx.Observable<Msg>;

export const map =
  <A, Msg>(f: (a: A) => Msg) =>
  (sub: Sub<A>): Sub<Msg> => {
    return sub.pipe(Rx.map(f));
  };

export const batch = <Msg>(arr: Array<Sub<Msg>>): Sub<Msg> => {
  return Rx.merge(...arr);
};

export const None: Sub<never> = Rx.EMPTY;
