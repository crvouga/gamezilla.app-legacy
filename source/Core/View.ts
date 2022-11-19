import * as Platform from "./Platform"

export type View<Dom, Msg> = ($d: Platform.$d<Msg>) => Dom

export const map =
  <Dom, A, Msg>(f: (a: A) => Msg) =>
    (htmlA: View<Dom, A>): View<Dom, Msg> =>
      ($d) =>
        htmlA((a) => $d(f(a)))
