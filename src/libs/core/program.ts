import * as Rx from "rxjs";
import { Cmd } from "./cmd";
import { Sub } from "./sub";
import { Posix } from "./unix-time";

//
//
//
//  Model
//
//
//

export type State<Model, Msg> = {
  model: Model & { _debugId: number; _now: Posix };
  cmd: Cmd<Msg>;
  msg?: Msg;
  runningDebugId: number;
};

export type Program<Model, Msg> = {
  dispatch: dispatch<Msg>;
  sub$: Sub<Msg>;
  state$: Rx.BehaviorSubject<State<Model, Msg>>;
};

export type dispatch<Msg> = (msg: Msg) => void;

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
  init: { model: Model; cmd?: Cmd<Msg> };
  update: (input: { now: Posix; msg: Msg; model: Model }) => {
    model: Model;
    cmd?: Cmd<Msg>;
  };
  subscriptions: (input: { now: Posix; model: Model }) => Sub<Msg>;
}): Program<Model, Msg> => {
  const state$ = new Rx.BehaviorSubject<State<Model, Msg>>({
    runningDebugId: 0,
    model: {
      ...init.model,
      _debugId: 0,
      _now: Posix.fromNumber(Date.now()),
    },
    cmd: init.cmd ?? Cmd.None,
  });

  const dispatch = (msg: Msg) => {
    const state = state$.getValue();
    if (state.model._debugId < state.runningDebugId) {
      console.log("[program] skip msg");
      return;
    }
    const updated = update({
      now: state.model._now,
      msg,
      model: state.model,
    });

    const debugIdNext = state.model._debugId + 1;

    state$.next({
      runningDebugId: debugIdNext,
      model: {
        ...updated.model,
        _debugId: debugIdNext,
        _now: Posix.fromNumber(Date.now()),
      },
      cmd: updated.cmd ?? Cmd.None,
      msg,
    });
  };

  const sub$ = state$.pipe(
    Rx.switchMap((state) => {
      return subscriptions({
        now: state.model._now,
        model: state.model,
      });
    })
  );

  return {
    dispatch,
    sub$,
    state$,
  };
};

const run = <Model, Msg>(program: Program<Model, Msg>): (() => void) => {
  const subSub = program.sub$.subscribe((msg) => {
    program.dispatch(msg);
  });

  const cmdSub = program.state$.subscribe(({ cmd }) => {
    // TODO: use a scheduler
    // Make sure that the view render is done before the cmd is executed
    // because cmd might do animations
    setTimeout(() => {
      cmd(program.dispatch);
    }, 1);
  });

  return () => {
    subSub.unsubscribe();
    cmdSub.unsubscribe();
  };
};

const subscribe = <Model, Msg>(
  program: Program<Model, Msg>,
  subscriber: (state: State<Model, Msg>) => void
): (() => void) => {
  const sub = program.state$.subscribe((state) => {
    subscriber(state);
  });
  return () => {
    sub.unsubscribe();
  };
};

export const Program = {
  create,
  run,
  subscribe,
};
