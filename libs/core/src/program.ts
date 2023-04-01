import * as Rx from 'rxjs';
import { Cmd } from './cmd';
import { Posix } from './unix-time';
import { Sub } from './sub';

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
};

export type Program<Model, Msg> = {
  $send: $send<Msg>;
  sub$: Sub<Msg>;
  state$: Rx.BehaviorSubject<State<Model, Msg>>;
};

export type $send<Msg> = (msg: Msg) => void;

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
  let runningDebugId = 0;

  const state$ = new Rx.BehaviorSubject<State<Model, Msg>>({
    model: {
      ...init.model,
      _debugId: runningDebugId,
      _now: Posix.fromNumber(Date.now()),
    },
    cmd: init.cmd ?? Cmd.None,
  });

  const $send = (msg: Msg) => {
    const current = state$.getValue();
    const updated = update({
      now: current.model._now,
      msg,
      model: current.model,
    });
    const debugIdNext = current.model._debugId + 1;

    runningDebugId = debugIdNext;
    state$.next({
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
      if (runningDebugId === state.model._debugId) {
        return subscriptions({
          now: state.model._now,
          model: state.model,
        });
      }
      console.log('[program] skip subscription');
      return Rx.EMPTY;
    })
  );

  return {
    $send,
    sub$,
    state$,
  };
};

const run = <Model, Msg>(program: Program<Model, Msg>): (() => void) => {
  const subSub = program.sub$.subscribe((msg) => {
    program.$send(msg);
  });

  const cmdSub = program.state$.subscribe(({ cmd }) => {
    cmd(program.$send);
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
