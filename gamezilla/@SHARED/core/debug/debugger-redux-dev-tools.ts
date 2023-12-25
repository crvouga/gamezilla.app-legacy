/**
 * Integration with _Redux DevTool Extension_.
 *
 * Please check the [docs](https://github.com/zalmoxisus/redux-dev-tools-extension/tree/master/docs/API) fur further information.
 *
 * @since 0.5.0
 */
import * as Json from "../data/json";
import { Result, isErr } from "../data/result";
import { Program } from "../program";
import { PubSub } from "../sub";
import { Task } from "../task";
import { toMsgPayload, toMsgType } from "../utils";
import { p } from "../utils/pipe";
import {
  Debug,
  Debugger,
  DebuggerDeps,
  Global,
  MsgWithDebug,
} from "./debugger";

type Unsubscribe = () => void;

/**
 * Defines a _Redux DevTool Extension_ object.
 * @category model
 * @since 0.5.0
 */
export interface ReduxDevToolsBrowserExtension {
  connect: <Model, Msg extends object>() => ReduxDevToolsConnection<Model, Msg>;
}

/**
 * Defines a _Redux DevTool Extension_ connection object.
 * @category model
 * @since 0.5.0
 */
export interface ReduxDevToolsConnection<Model, Msg extends object> {
  subscribe: (listener?: (m: DevToolMsg) => void) => Unsubscribe;
  send(action: null, state: LiftedState<Model>): void;
  send(action: Msg, state: Model): void;
  init: (state: Model) => void;
  error: (message: unknown) => void;
  unsubscribe: () => void;
}

type DevToolMsg = Start | Action | Monitor;

interface Start {
  type: "START";
}

interface Action {
  type: "ACTION";
  payload: unknown;
}

interface Monitor {
  type: "DISPATCH";
  payload: {
    type:
      | "JUMP_TO_STATE"
      | "JUMP_TO_ACTION"
      | "RESET"
      | "ROLLBACK"
      | "COMMIT"
      | "IMPORT_STATE"
      | "TOGGLE_ACTION";
    [k: string]: unknown;
  };
  [k: string]: unknown;
}

interface LiftedState<Model> {
  actionsById: Record<string, unknown>;
  computedStates: Array<{ state: Model }>;
  currentStateIndex: number;
  nextActionId: number;
  skippedActionIds: number[];
  stagedActionIds: number[];
  isPaused: boolean;
}

interface DevToolHandlerR<Model, Msg extends object>
  extends DebuggerDeps<Model, Msg> {
  connection: ReduxDevToolsConnection<Model, Msg>;
}

/**
 * Gets a _Redux DevTool Extension_ connection in case the extension is available
 * @category utils
 * @since 0.5.0
 */
export const getBrowserExtensionConnection = <Model, Msg extends object>(
  global: Global
): ReduxDevToolsConnection<Model, Msg> | null => {
  return hasExtension(global)
    ? global.__REDUX_DEVTOOLS_EXTENSION__.connect<Model, Msg>()
    : null;
};

/**
 * **[UNSAFE]** Type guard to check if _Redux DevTool Extension_ is available.
 *
 * This is "tagged" as unsafe because the check is really loose.
 * @since 0.5.0
 */
const hasExtension = (
  global: Global
): global is Global & {
  __REDUX_DEVTOOLS_EXTENSION__: ReduxDevToolsBrowserExtension;
} => {
  return "__REDUX_DEVTOOLS_EXTENSION__" in global;
};

/**
 * **[UNSAFE]** Debug through _Redux DevTool Extension_
 * @category constructors
 * @since 0.5.4
 */
export const makeDebugger = <Model, Msg extends object>(
  connection: ReduxDevToolsConnection<Model, Msg>
): Debugger<Model, Msg> => {
  return (d) => {
    const deps = { ...d, connection };

    // --- Subscribe to extension in order to receive messages from monitor
    connection.subscribe(handleSubscription(deps));

    return {
      debug: handleActions(deps),
      stop: connection.unsubscribe,
    };
  };
};

/**
 * **[UNSAFE]** Handles the execution of an effect related to an incoming messages sent from extension monitor.
 * @since 0.5.0
 */
const handleSubscription = <Model, Msg extends object>(
  deps: DevToolHandlerR<Model, Msg>
): ((msg: DevToolMsg) => void) => {
  const handler = handleIncomingMsg(deps);

  return (msg) => {
    const result = handler(msg);
    if (isErr(result)) {
      console.warn("[REDUX DEV TOOL]", result.error);
      return;
    }
    result.value();
  };
};

/**
 * **[UNSAFE]** Handles incoming messages sent from extension monitor.
 *
 * This is largely inspired by https://github.com/zalmoxisus/mobx-remotedev/blob/master/src/monitorActions.js
 *
 * **Note:** the monitor can dispatch messages of any shape that will be re-dispatched into the application; these messages **are not validated** and can lead to unexpected behaviours.
 * @since 0.5.0
 */
const handleIncomingMsg = <Model, Msg extends object>({
  connection,
  init,
  dispatch,
}: DevToolHandlerR<Model, Msg>): ((
  msg: DevToolMsg
) => Result<string, Task<void>>) => {
  const dispatchToApp =
    (m: unknown): Task<void> =>
    async () =>
      dispatch(m as Msg);

  const reInit: Task<void> = async () => connection.init(init);

  const update = (payload: Model): Task<void> =>
    dispatchToApp({ type: "__DebugUpdateModel__", payload });

  const restart =
    (model: Model): Task<void> =>
    async () =>
      connection.init(model);

  const liftState =
    (state: LiftedState<Model>): Task<void> =>
    async () =>
      connection.send(null, state);

  const toggle = toggleAction(dispatch);

  return (msg) => {
    switch (msg.type) {
      case "START":
        return Result.ok(reInit);

      case "ACTION": {
        const result = Json.parse(String(msg.payload));
        switch (result.t) {
          case "err":
            return Result.err(result.error.message);

          case "ok":
            return Result.ok(dispatchToApp(result.value));
        }
      }

      case "DISPATCH":
        switch (msg.payload.type) {
          case "JUMP_TO_STATE":
            return p(parseJump<Model>(msg), (x) => Result.mapOk(x, update));

          case "JUMP_TO_ACTION":
            return p(parseJump<Model>(msg), (x) => Result.mapOk(x, update));

          case "RESET":
            return Result.ok(
              p(
                update(init),
                Task.chain(() => reInit)
              )
            );

          case "ROLLBACK":
            return p(parseRollback<Model>(msg), (x) =>
              Result.mapOk(x, (m) =>
                p(
                  update(m),
                  Task.chain(() => restart(m))
                )
              )
            );

          case "COMMIT":
            // return Result.Ok(restart(debug$.getValue()[1]));
            return Result.err("idk");

          case "IMPORT_STATE":
            return p(parseImportState<Model>(msg), (x) =>
              Result.mapOk(x, (liftedState) =>
                p(
                  update(
                    // @ts-ignore
                    liftedState.computedStates[
                      liftedState.computedStates.length - 1
                    ].state
                  ),
                  Task.chain(() => liftState(liftedState))
                )
              )
            );

          case "TOGGLE_ACTION":
            return p(parseToggleAction<Model>(msg), (x) =>
              Result.mapOk(x, ([id, liftedState]) =>
                p(toggle(id, liftedState), Task.chain(liftState))
              )
            );

          default:
            return Result.err(msg.payload.type);
        }

      default:
        return Result.err("unhandled case");
    }
  };
};

/**
 * Handles debugging actions.
 *
 * The `MESSAGE` action will send the message payload and state to the connected extension (`connection`).
 * @since 0.5.0
 */
const handleActions = <Model, Msg extends object>({
  connection,
}: DevToolHandlerR<Model, Msg>): Debug<Model, Msg> => {
  return ([action, model]) =>
    action.type === "MESSAGE"
      ? connection.send(action.payload, model)
      : undefined;
};

/**
 * Parses a `JUMP` message.
 *
 * @since 0.5.0
 */
const parseJump = <Model>(msg: Monitor): Result<string, Model> => {
  return p(
    Json.parse(String(msg["state"])),
    Result.mapErr((problem) => problem.message),
    (x) =>
      Result.mapOk(
        x,
        (value) =>
          // @ts-ignore
          value as Model
      )
  );
};

/**
 * Parses a `ROLLBACK` message.
 *
 * @since 0.5.0
 */
const parseRollback = <Model>(msg: Monitor): Result<string, Model> => {
  return p(
    Json.parse(String(msg["state"])),
    Result.mapErr((problem) => problem.message),
    (x) =>
      Result.mapOk(
        x,
        (u) =>
          // @ts-ignore
          u as Model
      )
  );
};

/**
 * Parses an `IMPORT_STATE` message.
 *
 * @since 0.5.0
 */
const parseImportState = <Model>(
  msg: Monitor
): Result<string, LiftedState<Model>> => {
  return typeof msg.payload["nextLiftedState"] === "object" &&
    msg.payload["nextLiftedState"] !== null
    ? Result.ok(msg.payload["nextLiftedState"] as LiftedState<Model>)
    : Result.err("IMPORT_STATE message has some bad payload...");
};

/**
 * Parses a `TOGGLE_ACTION` message.
 *
 * @since 0.5.0
 */
const parseToggleAction = <Model>(
  msg: Monitor
): Result<string, [number, LiftedState<Model>]> => {
  const getId = p(
    msg.payload["id"],
    Result.fromNullable("TOGGLE_ACTION message has some bad payload..."),
    (_) => Result.mapOk(_, (x) => x as number)
  );

  if (getId.t === "err") {
    return getId;
  }

  const parseState = p(
    Json.parse(String(msg["state"])),
    (_) =>
      Result.mapOk(
        _,
        // @ts-ignore
        (u) => u as LiftedState<Model>
      ),
    Result.mapErr((problem) => problem.message)
  );

  if (parseState.t === "err") {
    return parseState;
  }

  return Result.ok([getId.value, parseState.value]);
};

/**
 * Handles toggling a specific action (identified by `id` parameter).
 *
 * It re-executes all the actions (and updates the store) excluding the toggled one.
 *
 * The implementation is taken from [MobX dev tool integration](https://github.com/zalmoxisus/mobx-remotedev/blob/master/src/monitorActions.js#L22)
 *
 * @since 0.5.0
 */

const toggleAction =
  <Model, Msg extends object>(
    dispatch: (m: MsgWithDebug<Model, Msg>) => void
  ) =>
  (id: number, liftedState: LiftedState<Model>): Task<LiftedState<Model>> =>
  async () => {
    const state = unsafeCopy(liftedState);

    const { skippedActionIds, stagedActionIds, computedStates, actionsById } =
      state;

    const skippedIndex = skippedActionIds.indexOf(id);
    const skipped = skippedIndex !== -1;
    const actionIndex = stagedActionIds.indexOf(id);

    if (actionIndex === -1) {
      return state;
    }

    dispatch({
      type: "__DebugUpdateModel__",
      // @ts-ignore
      payload: computedStates[actionIndex - 1].state,
    });

    const start = skipped ? actionIndex : actionIndex + 1;
    const end = stagedActionIds.length;

    for (let i = start; i < end; i++) {
      const currentActionId = stagedActionIds[i];

      if (
        i !== actionIndex &&
        currentActionId &&
        skippedActionIds.indexOf(currentActionId) !== -1
      ) {
        continue; // it's already skipped
      }

      if (currentActionId) {
        dispatch({
          type: "__DebugApplyMsg__",
          // @ts-ignore
          payload: actionsById[currentActionId].action,
        });
      }
    }

    if (skipped) {
      skippedActionIds.splice(skippedIndex, 1);
    } else {
      skippedActionIds.push(id);
    }

    return state;
  };

// poor man deep clone...
const unsafeCopy = <A>(a: A): A => {
  return JSON.parse(JSON.stringify(a));
};

/**
 * Attaches program to the redux dev tools extension.
 */
export const attachDebuggerBrowserExtension = <Model, Msg extends object, Ctx>(
  program: Program<Model, Msg, Ctx>,
  global: Global = window
) => {
  const connection = getBrowserExtensionConnection<Model, Msg>(global);

  if (connection) {
    return attachDebugger(program, connection);
  }

  return null;
};

export const attachDebugger = <Model, Msg extends object, Ctx>(
  program: Program<Model, Msg, Ctx>,
  connection: ReduxDevToolsConnection<Model, Msg>
) => {
  connection.subscribe((msg) => {
    switch (msg.type) {
      case "ACTION": {
        return;
      }
      case "DISPATCH": {
        return;
      }
      case "START": {
        return;
      }
    }
  });

  const Debugger = makeDebugger<Model, Msg>(connection);

  const debuggerInstance = Debugger({
    dispatch: (msg) => {
      if ("type" in msg) {
        switch (msg.type) {
          case "__DebugApplyMsg__": {
            return;
          }
          case "__DebugStarted__": {
            return;
          }
          case "__DebugUpdateModel__": {
            program.setModel(msg.payload);
            return;
          }
        }
      }
    },
    init: program.getModel(),
  });

  const started = new Promise<null>((resolve) => {
    const unsubscribe = connection.subscribe((msg) => {
      switch (msg.type) {
        case "START": {
          unsubscribe();
          resolve(null);
          break;
        }
        default: {
          break;
        }
      }
    });
  });

  const sub = PubSub.create<{ msg: Msg; model: Model }>();

  program.subscribe((model, _ctx, msg) => {
    if (msg) {
      sub.publish({ msg, model });
    }
  });

  started.then(() => {
    sub.subscribe(({ model, msg }) => {
      const action = {
        type: toMsgType(msg),
        payload: toMsgPayload(msg, {}),
      };
      // @ts-ignore
      connection.send(action, model);
    });
  });

  return { ...debuggerInstance, started };
};
