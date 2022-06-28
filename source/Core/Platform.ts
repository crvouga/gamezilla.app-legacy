import * as Rx from "rxjs"
import * as Cmd from "./Cmd"
import * as Option from "./Option"
import * as Sub from "./Sub"

export type Dispatch<Msg> = (msg: Msg) => void

export type Program<Model, Msg> = {
  dispatch: Dispatch<Msg>
  cmd$: Cmd.Cmd<Msg>
  sub$: Sub.Sub<Msg>
  model$: Rx.Observable<Model>
}

export const Program = <Model, Msg>(
  init: [Model, Cmd.Cmd<Msg>],
  update: (msg: Msg, model: Model) => [Model, Cmd.Cmd<Msg>],
  subscriptions: (model: Model) => Sub.Sub<Msg>,
): Program<Model, Msg> => {
  const state$ = new Rx.BehaviorSubject(init)
  const dispatch: Dispatch<Msg> = (msg) =>
    state$.next(update(msg, state$.getValue()[0]))

  const cmd$ = state$.pipe(
    Rx.startWith(init),
    Rx.map((state) => state[1]),
    Rx.distinctUntilChanged(),
    Rx.mergeAll(),
  )

  const model$ = state$.pipe(
    Rx.map((state) => state[0]),
    Rx.distinctUntilChanged(),
  )

  const sub$ = model$.pipe(Rx.switchMap((model) => subscriptions(model)))

  return { dispatch, cmd$, sub$, model$ }
}

export const ProgramWithFlags = <Flags, Model, Msg>(
  init: (flags: Flags) => [Model, Cmd.Cmd<Msg>],
  update: (msg: Msg, model: Model) => [Model, Cmd.Cmd<Msg>],
  subscriptions: (model: Model) => Sub.Sub<Msg>,
): ((flags: Flags) => Program<Model, Msg>) => {
  return (flags) => Program(init(flags), update, subscriptions)
}

export const withStop = (
  signal: Rx.Observable<unknown>,
): (<Model, Msg>(program: Program<Model, Msg>) => Program<Model, Msg>) => {
  return (program) => {
    const { cmd$, model$, sub$, ...rest } = program

    return {
      ...rest,
      model$: model$.pipe(Rx.takeUntil(signal)),
      cmd$: cmd$.pipe(Rx.takeUntil(signal)),
      sub$: sub$.pipe(Rx.takeUntil(signal)),
    }
  }
}

export const run = <Model, Msg>(
  program: Program<Model, Msg>,
): Rx.Observable<Model> => {
  const { dispatch, cmd$, sub$, model$ } = program

  cmd$.subscribe((task) => task().then(Option.map(dispatch)))

  sub$.subscribe(dispatch)

  return model$
}
