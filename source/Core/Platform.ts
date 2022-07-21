import * as Rx from "rxjs"
import * as Cmd from "./Cmd"
import * as Option from "./Option"
import * as Sub from "./Sub"

//
//
//
//  Model
//
//
//

export type State<Model, Msg> = {
  model: Model
  cmd: Cmd.Cmd<Msg>
  msg?: Msg
}

export type Program<Model, Msg> = {
  dispatch: Dispatch<Msg>
  cmd$: Cmd.Cmd<Msg>
  sub$: Sub.Sub<Msg>
  state$: Rx.BehaviorSubject<State<Model, Msg>>
}

export type Dispatch<Msg> = (msg: Msg) => void

//
//
//
// Program
//
//
//

export const worker = <Model, Msg>({
  init,
  update,
  subscriptions,
}: {
  init: [Model, Cmd.Cmd<Msg>]
  update: (msg: Msg, model: Model) => [Model, Cmd.Cmd<Msg>]
  subscriptions: (model: Model) => Sub.Sub<Msg>
}): Program<Model, Msg> => {
  const initialState: State<Model, Msg> = {
    model: init[0],
    cmd: init[1],
  }

  const state$ = new Rx.BehaviorSubject(initialState)

  const dispatch: Dispatch<Msg> = (msg) => {
    const prev = state$.getValue()
    const [model, cmd] = update(msg, prev.model)
    state$.next({
      model,
      cmd,
      msg,
    })
  }

  const cmd$ = state$.pipe(Rx.mergeMap((state) => state.cmd))

  const sub$ = state$.pipe(Rx.switchMap((state) => subscriptions(state.model)))

  return {
    dispatch,
    cmd$,
    sub$,
    state$,
  }
}

//
//
//
//
//
//
//

export const withStop =
  (signal: Rx.Subject<unknown>) =>
  <Model, Msg>(program: Program<Model, Msg>): Program<Model, Msg> => {
    const { cmd$, sub$, ...rest } = program

    return {
      ...rest,
      cmd$: cmd$.pipe(Rx.takeUntil(signal)),
      sub$: sub$.pipe(Rx.takeUntil(signal)),
    }
  }

//
//
//
//
//
//

export const run = <Model, Msg>(program: Program<Model, Msg>): (() => void) => {
  const { dispatch, cmd$, sub$ } = program

  // WARNING
  // Order matters!
  // sub$.subscribe must happen before cmd$.subscribe to prevent bugs when using the dev tools debugger

  const subSub = sub$.subscribe(dispatch)

  const cmdSub = cmd$.subscribe((task) => task().then(Option.map(dispatch)))

  return () => {
    cmdSub.unsubscribe()
    subSub.unsubscribe()
  }
}
