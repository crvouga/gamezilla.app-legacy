import * as Rx from "rxjs";
import * as Browser from "../Browser";
import * as Cmd from "../Cmd";
import * as Html from "../Html";
import * as Sub from "../Sub";
import * as Task from "../Task";
import { RunDebugger } from "./debugger";
import {
  DebugData,
  DebuggerDeps,
  debugInit,
  subscriptionsWithDebug,
  updateWithDebug,
} from "./debugger-commons";

type Program<Model, Msg, Dom> = Browser.Program<Model, Msg, Dom> & {
  startDebugger: Task.Task<void>;
};

export const Application = <Model, Msg, Dom>({
  init,
  onLocationChange,
  subscriptions,
  update,
  view,
}: {
  onLocationChange: (location: Browser.Location) => Msg;
  init: (location: Browser.Location) => [Model, Cmd.Cmd<Msg>];
  update: (msg: Msg, model: Model) => [Model, Cmd.Cmd<Msg>];
  view: (model: Model) => Html.Html<Dom, Msg>;
  subscriptions: (model: Model) => Sub.Sub<Msg>;
}): Program<Model, Msg, Dom> => {
  return createApplication({
    stopSignal: Rx.EMPTY,
    onLocationChange,
    init,
    update,
    view,
    subscriptions,
  });
};

const createApplication = <Model, Msg, Dom>({
  stopSignal,
  onLocationChange,
  init,
  subscriptions,
  update,
  view,
}: {
  stopSignal: Rx.Observable<unknown>;
  onLocationChange: (location: Browser.Location) => Msg;
  init: (location: Browser.Location) => [Model, Cmd.Cmd<Msg>];
  update: (msg: Msg, model: Model) => [Model, Cmd.Cmd<Msg>];
  view: (model: Model) => Html.Html<Dom, Msg>;
  subscriptions: (model: Model) => Sub.Sub<Msg>;
}): Program<Model, Msg, Dom> => {
  // const history = History.createBrowserHistory(); // this is needed only to generate init model for debug$ :S

  const initModel = init(Browser.getLocation())[0];

  const debug$ = new Rx.BehaviorSubject<DebugData<Model, Msg>>([
    debugInit(),
    initModel,
  ]);

  const debugId$ = new Rx.BehaviorSubject<string | undefined>(undefined);

  const program = Browser.Application({
    onLocationChange,
    init,
    update: updateWithDebug({
      update,
      debug$,
      debugId$,
    }),
    view,
    subscriptions: subscriptionsWithDebug({
      subscriptions,
      debugId$,
    }),
  });

  const runDebugger = RunDebugger<Model, Msg>(window, stopSignal);

  const startDebugger = async () => {
    const task = runDebugger({
      debug$,
      init: initModel,
      dispatch: program.dispatch as DebuggerDeps<Model, Msg>["dispatch"],
    });

    await task();

    // wait for debugger to actually start
    await new Promise((resolve) => setTimeout(resolve, 1000));
  };

  return { ...program, startDebugger };
};

export const Element = <Model, Msg, Dom>({
  init,
  update,
  view,
  subscriptions,
}: {
  init: [Model, Cmd.Cmd<Msg>];
  update: (msg: Msg, model: Model) => [Model, Cmd.Cmd<Msg>];
  view: (model: Model) => Html.Html<Dom, Msg>;
  subscriptions: (model: Model) => Sub.Sub<Msg>;
}): Program<Model, Msg, Dom> => {
  return createElement({
    stopSignal: Rx.EMPTY,
    init,
    update,
    view,
    subscriptions,
  });
};

// --- Internal
const createElement = <Model, Msg, Dom>({
  stopSignal,
  init,
  update,
  view,
  subscriptions,
}: {
  stopSignal: Rx.Observable<unknown>;
  init: [Model, Cmd.Cmd<Msg>];
  update: (msg: Msg, model: Model) => [Model, Cmd.Cmd<Msg>];
  view: (model: Model) => Html.Html<Dom, Msg>;
  subscriptions: (model: Model) => Sub.Sub<Msg>;
}): Program<Model, Msg, Dom> => {
  const initModel = init[0];

  const debug$ = new Rx.BehaviorSubject<DebugData<Model, Msg>>([
    debugInit(),
    initModel,
  ]);
  const debugId$ = new Rx.BehaviorSubject<string | undefined>(undefined);

  const program = Browser.Element({
    init,
    update: updateWithDebug<Model, Msg>({
      debug$,
      debugId$,
      update,
    }),
    view,
    subscriptions: subscriptionsWithDebug({
      subscriptions,
      debugId$,
    }),
  });

  const runDebugger = RunDebugger<Model, Msg>(window, stopSignal);

  const startDebugger = async () => {
    const task = runDebugger({
      debug$,
      init: initModel,
      dispatch: program.dispatch as DebuggerDeps<Model, Msg>["dispatch"],
    });

    await task();

    // wait for debugger to actually start
    await new Promise((resolve) => setTimeout(resolve, 1000));
  };

  return { ...program, startDebugger };
};

//
//
//
//
//
//
//

// export const run = <Model, Msg, Dom>(
//   wait: number,
//   program: Browser.Program<Model, Msg, Dom>,
//   renderer: Browser.Renderer<Dom>,
// ): Rx.Observable<Model> => {
//   // why?
//   // wait for redux devtools debugger to start before running program
//   // because messages were being dispatched before the dev tools started
//   // resulting in initial messages not being logged
//   //
//   // todo: actually subscribe to the redux dev tools start message instead of using a timeout

//   const out$ = new Rx.Subject<Model>()

//   setTimeout(() => {
//     const model$ = Browser.run(program, renderer)

//     model$.subscribe((model) => {
//       out$.next(model)
//     })
//   }, wait)

//   return out$
// }
