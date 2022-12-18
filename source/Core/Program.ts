
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

const create = <Model, Msg>({
  init,
  update,
  subscriptions,
}: {
  init: [Model, Cmd<Msg>]
  update: (msg: Msg, model: Model) => [Model, Cmd<Msg>]
  subscriptions: (model: Model) => Sub<Msg>
}): Program<Model, Msg> => {
  const state$ = new Rx.BehaviorSubject<State<Model, Msg>>({
    model: init[0],
    cmd: init[1],
  })

  const $d = (msg: Msg) => {
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


const run = <Model, Msg>(program: Program<Model, Msg>): () => void => {
  const subSub = program.sub$.subscribe((msg) => {
    program.$d(msg)
  })

  const cmdSub = program.state$.subscribe(({ cmd }) => {
    cmd(program.$d)
  })

  return () => {
    subSub.unsubscribe()
    cmdSub.unsubscribe()
  }
}


const subscribe = <Model, Msg>(program: Program<Model, Msg>, subscriber: (state: State<Model, Msg>) => void): () => void => {
  const sub = program.state$.subscribe((state) => {
    subscriber(state)
  })
  return () => {
    sub.unsubscribe()
  }
}

export const Program = {
  create,
  run,
  subscribe,
}