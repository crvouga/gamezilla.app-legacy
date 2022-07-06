import * as Rx from "rxjs";
import { Result } from "Core";
import * as Cmd from "./Cmd";
import * as Option from "./Option";
import * as Platform from "./Platform";
import * as Sub from "./Sub";
import * as Task from "./Task";
import * as View from "./View";

//
//
//
// Program
//
//
//

export type Program<Model, Msg, Dom> = Platform.Program<Model, Msg> & {
  view$: Rx.Observable<View.View<Dom, Msg>>;
};

export type Renderer<Dom> = (dom: Dom) => void;

//
//
//
// History
//
//
//

export type Location = {
  pathname: string;
  query: { [key: string]: string };
};

export const location$ = new Rx.Observable<Location>((subscriber) => {
  const handler = () => {
    subscriber.next(getLocation());
  };
  window.addEventListener("popstate", handler);
  return () => {
    window.removeEventListener("popstate", handler);
  };
});

export const getLocation = (): Location => {
  return {
    pathname: window.location.pathname,
    query: Object.fromEntries(
      new URLSearchParams(window.location.search).entries(),
    ),
  };
};

//
//
//
// Navigation
//
//
//

export const reload: Cmd.Cmd<never> = Rx.of(async () => {
  window.location.reload();
  window.dispatchEvent(new Event("popstate"));
  return Option.None;
});

export const push = (url: string): Cmd.Cmd<never> => {
  return Rx.of(async () => {
    window.history.pushState(null, "", url);
    window.dispatchEvent(new Event("popstate"));
    return Option.None;
  });
};

export const replace = (url: string): Cmd.Cmd<never> => {
  return Rx.of(async () => {
    window.history.replaceState(null, "", url);
    window.dispatchEvent(new Event("popstate"));
    return Option.None;
  });
};

export const back: Cmd.Cmd<never> = Rx.of(async () => {
  window.history.back();
  window.dispatchEvent(new Event("popstate"));
  return Option.None;
});

//
//
//
// Dom
//
//
//

export type Problem = { type: "ElementNotFound" };

export type FocusResult = Result.Result<Problem, {}>;

export const focus =
  (htmlId: string): Task.Task<FocusResult> =>
  async () => {
    const element = document.getElementById(htmlId);

    if (element) {
      element.focus();
      return Result.Ok({});
    }

    return Result.Err({ type: "ElementNotFound" });
  };

export type BlurResult = Result.Result<Problem, {}>;

export const blur =
  (htmlId: string): Task.Task<BlurResult> =>
  async () => {
    const element = document.getElementById(htmlId);

    if (element) {
      element.blur();
      return Result.Ok({});
    }

    return Result.Err({ type: "ElementNotFound" });
  };

//
//
//
// Program
//
//
//

export const application = <Model, Msg, Dom>({
  onLocationChange,
  init,
  update,
  view,
  subscriptions,
}: {
  onLocationChange: (location: Location) => Msg;
  init: (location: Location) => [Model, Cmd.Cmd<Msg>];
  update: (msg: Msg, model: Model) => [Model, Cmd.Cmd<Msg>];
  view: (model: Model) => View.View<Dom, Msg>;
  subscriptions: (model: Model) => Sub.Sub<Msg>;
}): Program<Model, Msg, Dom> => {
  const onChangeLocation$ = location$.pipe(
    Rx.map((location) => onLocationChange(location)),
  );

  const subs = (model: Model): Sub.Sub<Msg> =>
    Sub.batch([subscriptions(model), onChangeLocation$]);

  return element({
    init: init(getLocation()),
    update,
    view,
    subscriptions: subs,
  });
};

export const element = <Model, Msg, Dom>({
  init,
  view,
  update,
  subscriptions,
}: {
  init: [Model, Cmd.Cmd<Msg>];
  update: (msg: Msg, model: Model) => [Model, Cmd.Cmd<Msg>];
  view: (model: Model) => View.View<Dom, Msg>;
  subscriptions: (model: Model) => Sub.Sub<Msg>;
}): Program<Model, Msg, Dom> => {
  const program = Platform.worker({
    init,
    update,
    subscriptions,
  });

  const view$ = program.state$.pipe(Rx.map((state) => view(state.model)));

  return {
    ...program,
    view$: view$,
  };
};

export const withStop =
  (signal: Rx.Subject<unknown>) =>
  <Model, Msg, Dom>(
    program: Program<Model, Msg, Dom>,
  ): Program<Model, Msg, Dom> => {
    const { view$, ...rest } = program;

    return {
      ...Platform.withStop(signal)(rest),
      view$: view$.pipe(Rx.takeUntil(signal)),
    };
  };

export const run = <Model, Msg, Dom>(
  program: Program<Model, Msg, Dom>,
  renderer: Renderer<Dom>,
): (() => void) => {
  const { dispatch, view$ } = program;

  const htmlSub = view$.subscribe((view) => renderer(view(dispatch)));

  const stop = Platform.run(program);

  return () => {
    htmlSub.unsubscribe();
    stop();
  };
};
