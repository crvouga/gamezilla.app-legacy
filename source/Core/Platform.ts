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

type State<Model, Msg> = [Model, Cmd.Cmd<Msg>] | [Model, Cmd.Cmd<Msg>, Msg]

export type Program<Model, Msg> = {
  dispatch: Dispatch<Msg>
  cmd$: Cmd.Cmd<Msg>
  sub$: Sub.Sub<Msg>
  model$: Rx.Observable<Model>
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

export const Worker = <Model, Msg>({
  init,
  update,
  subscriptions,
}: {
  init: [Model, Cmd.Cmd<Msg>]
  update: (msg: Msg, model: Model) => [Model, Cmd.Cmd<Msg>]
  subscriptions: (model: Model) => Sub.Sub<Msg>
}): Program<Model, Msg> => {
  const state$ = new Rx.BehaviorSubject<State<Model, Msg>>(init)

  const dispatch: Dispatch<Msg> = (msg) => {
    state$.next([...update(msg, state$.getValue()[0]), msg])
  }

  const cmd$ = state$.pipe(Rx.mergeMap((state) => state[1]))

  const model$ = state$.pipe(Rx.map((state) => state[0]))

  const sub$ = model$.pipe(Rx.switchMap((model) => subscriptions(model)))

  return {
    dispatch,
    cmd$,
    sub$,
    model$,
    state$,
  }
}

export const withStop =
  (signal: Rx.Subject<unknown>) =>
  <Model, Msg>(program: Program<Model, Msg>): Program<Model, Msg> => {
    const { cmd$, model$, sub$, state$, dispatch } = program

    return {
      model$: model$.pipe(Rx.takeUntil(signal)),
      cmd$: cmd$.pipe(Rx.takeUntil(signal)),
      sub$: sub$.pipe(Rx.takeUntil(signal)),
      state$,
      dispatch,
    }
  }

export const run = <Model, Msg>(
  program: Program<Model, Msg>,
): Rx.Observable<Model> => {
  const { dispatch, cmd$, sub$, model$ } = program

  // WARNING
  // Order matters!
  // sub$.subscribe must happen before cmd$.subscribe to prevent bugs when using the dev tools debugger

  sub$.subscribe(dispatch)

  cmd$.subscribe((task) => task().then(Option.map(dispatch)))

  return model$
}
