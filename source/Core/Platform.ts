import * as Rx from "rxjs"
import { Cmd } from "./Cmd"
import { Sub } from "./Sub"

//
//
//
//  Model
//
//
//

export type State<Model, Msg> = {
  model: Model
  cmd: Cmd<Msg>
  msg?: Msg
}

export type Program<Model, Msg> = {
  $d: $d<Msg>
  sub$: Sub<Msg>
  state$: Rx.BehaviorSubject<State<Model, Msg>>
}

export type $d<Msg> = (msg: Msg) => void

//
//
//
// Program
//
//
//

export const createProgram = <Model, Msg>({
  init,
  update,
  subscriptions,
}: {
  init: [Model, Cmd<Msg>]
  update: (msg: Msg, model: Model) => [Model, Cmd<Msg>]
  subscriptions: (model: Model) => Sub<Msg>
}): Program<Model, Msg> => {
  const initialState: State<Model, Msg> = {
    model: init[0],
    cmd: init[1],
  }

  const state$ = new Rx.BehaviorSubject(initialState)

  const $d: $d<Msg> = (msg) => {
    const prev = state$.getValue()
    const [model, cmd] = update(msg, prev.model)
    state$.next({
      model,
      cmd,
      msg,
    })
  }

  const sub$ = state$.pipe(Rx.switchMap((state) => subscriptions(state.model)))

  return {
    $d,
    sub$,
    state$,
  }
}
