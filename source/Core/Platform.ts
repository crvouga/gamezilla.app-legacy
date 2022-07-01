import * as Rx from "rxjs";
import * as Cmd from "./Cmd";
import * as Option from "./Option";
import * as Sub from "./Sub";

//
//
//
//  Model
//
//
//

type State<Model, Msg> = {
  model: Model;
  cmd: Cmd.Cmd<Msg>;
  msg?: Msg;
  // subscriptionStatus: "Subscribed" | "Unsubscribed"
};

export type Program<Model, Msg> = {
  dispatch: Dispatch<Msg>;
  cmd$: Cmd.Cmd<Msg>;
  sub$: Sub.Sub<Msg>;
  model$: Rx.Observable<Model>;
  state$: Rx.BehaviorSubject<State<Model, Msg>>;
};

export type Dispatch<Msg> = (msg: Msg) => void;

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
  init: [Model, Cmd.Cmd<Msg>];
  update: (msg: Msg, model: Model) => [Model, Cmd.Cmd<Msg>];
  subscriptions: (model: Model) => Sub.Sub<Msg>;
}): Program<Model, Msg> => {
  const state$ = new Rx.BehaviorSubject<State<Model, Msg>>({
    model: init[0],
    cmd: init[1],
    // subscriptionStatus: "Subscribed",
  });

  const dispatch: Dispatch<Msg> = (msg) => {
    const prev = state$.getValue();
    const [model, cmd] = update(msg, prev.model);
    state$.next({
      model,
      cmd,
      msg,
      // subscriptionStatus: prev.subscriptionStatus,
    });
  };

  const cmd$ = state$.pipe(Rx.mergeMap((state) => state.cmd));

  const model$ = state$.pipe(Rx.map((state) => state.model));

  const sub$ = state$.pipe(
    Rx.switchMap(
      (state) => subscriptions(state.model),
      // state.subscriptionStatus === "Subscribed"
      //   ? subscriptions(state.model)
      //   : Sub.None,
    ),
  );

  return {
    dispatch,
    cmd$,
    sub$,
    model$,
    state$,
  };
};

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
    const { cmd$, model$, sub$, ...rest } = program;

    return {
      ...rest,
      model$: model$.pipe(Rx.takeUntil(signal)),
      cmd$: cmd$.pipe(Rx.takeUntil(signal)),
      sub$: sub$.pipe(Rx.takeUntil(signal)),
    };
  };

//
//
//
//
//
//

export const run = <Model, Msg>(program: Program<Model, Msg>): (() => void) => {
  const { dispatch, cmd$, sub$ } = program;

  // WARNING
  // Order matters!
  // sub$.subscribe must happen before cmd$.subscribe to prevent bugs when using the dev tools debugger

  const subSub = sub$.subscribe(dispatch);

  const cmdSub = cmd$.subscribe((task) => task().then(Option.map(dispatch)));

  console.log("[program] started");

  return () => {
    cmdSub.unsubscribe();
    subSub.unsubscribe();
    console.log("[program] stopped");
  };
};
