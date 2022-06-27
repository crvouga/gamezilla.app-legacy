/**
 * The `Platform` module is the backbone of `elm-ts`.
 * It defines the base `program()` and `run()` functions which will be extended by more specialized modules.
 * _The Elm Architecture_ is implemented via **RxJS** `Observables`.
 *
 * @since 0.5.0
 */
import * as Rx from "rxjs"
import * as Cmd from "./Cmd"
import * as Option from "./Option"
import * as Sub from "./Sub"

/**
 * @category model
 * @since 0.5.0
 */
export interface Dispatch<Msg> {
  (msg: Msg): void
}

/**
 * `Program` is just an object that exposes the underlying streams which compose _The Elm Architecture_.
 * Even **Commands** and **Subscriptions** are expressed as `Observables` in order to mix them with ease.
 * @category model
 * @since 0.5.0
 */
export interface Program<Model, Msg> {
  dispatch: Dispatch<Msg>
  cmd$: Cmd.Cmd<Msg>
  sub$: Sub.Sub<Msg>
  model$: Rx.Observable<Model>
}

/**
 * `program()` is the real core of `elm-ts`.
 *
 * When a new `Program` is defined, a `BehaviorSubject` is created (because an initial value is needed) that will track every change to the `Model` and every `Cmd` executed.
 *
 * Every time `dispatch()` is called a new value, computed by the `update()` function, is added to the the stream.
 * @category constructors
 * @since 0.5.0
 */
export function Program<Model, Msg>(
  init: [Model, Cmd.Cmd<Msg>],
  update: (msg: Msg, model: Model) => [Model, Cmd.Cmd<Msg>],
  subscriptions: (model: Model) => Sub.Sub<Msg> = () => Sub.none,
): Program<Model, Msg> {
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

/**
 * Same as `program()` but with `Flags` that can be passed when the `Program` is created in order to manage initial values.
 * @category constructors
 * @since 0.5.0
 */
export function ProgramWithFlags<Flags, Model, Msg>(
  init: (flags: Flags) => [Model, Cmd.Cmd<Msg>],
  update: (msg: Msg, model: Model) => [Model, Cmd.Cmd<Msg>],
  subscriptions: (model: Model) => Sub.Sub<Msg> = () => Sub.none,
): (flags: Flags) => Program<Model, Msg> {
  return (flags) => Program(init(flags), update, subscriptions)
}

/**
 * Stops the `program` when `signal` Observable emits a value.
 * @category combinators
 * @since 0.5.4
 */
export function withStop(
  signal: Rx.Observable<unknown>,
): <Model, Msg>(program: Program<Model, Msg>) => Program<Model, Msg> {
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

/**
 * Runs the `Program`.
 *
 * Because the program essentially is an object of streams, "running it" means subscribing to these streams and starting to consume values.
 * @category utils
 * @since 0.5.0
 */
export function run<Model, Msg>(
  program: Program<Model, Msg>,
): Rx.Observable<Model> {
  const { dispatch, cmd$, sub$, model$ } = program

  cmd$.subscribe((task) => task().then(Option.map(dispatch)))

  sub$.subscribe(dispatch)

  return model$
}
