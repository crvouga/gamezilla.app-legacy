/**
 * Integration with _Redux DevTool Extension_.
 *
 * Please check the [docs](https://github.com/zalmoxisus/redux-devtools-extension/tree/master/docs/API) fur further information.
 *
 * @since 0.5.0
 */
import * as IO from "../IO"
import * as Json from "../Json"
import * as Option from "../Option"
import * as Result from "../Result"
import { Dispatch } from "../Platform"
import { pipe } from "../pipe"
import { Debug, Debugger, DebuggerR, Global, MsgWithDebug } from "./commons"

type Unsubscription = () => void

/**
 * Defines a _Redux DevTool Extension_ object.
 * @category model
 * @since 0.5.0
 */
export interface Extension {
  connect: <Model, Msg>() => Connection<Model, Msg>
}

/**
 * Defines a _Redux DevTool Extension_ connection object.
 * @category model
 * @since 0.5.0
 */
export interface Connection<Model, Msg> {
  subscribe: (listener?: Dispatch<DevToolMsg>) => Unsubscription
  send(action: null, state: LiftedState<Model>): void
  send(action: Msg, state: Model): void
  init: (state: Model) => void
  error: (message: unknown) => void
  unsubscribe: () => void
}

type DevToolMsg = Start | Action | Monitor

interface Start {
  type: "START"
}

interface Action {
  type: "ACTION"
  payload: unknown
}

interface Monitor {
  type: "DISPATCH"
  payload: {
    type:
      | "JUMP_TO_STATE"
      | "JUMP_TO_ACTION"
      | "RESET"
      | "ROLLBACK"
      | "COMMIT"
      | "IMPORT_STATE"
      | "TOGGLE_ACTION"
    [k: string]: unknown
  }
  [k: string]: unknown
}

interface LiftedState<Model> {
  actionsById: Record<string, unknown>
  computedStates: Array<{ state: Model }>
  currentStateIndex: number
  nextActionId: number
  skippedActionIds: number[]
  stagedActionIds: number[]
  isPaused: boolean
}

interface DevToolHandlerR<Model, Msg> extends DebuggerR<Model, Msg> {
  connection: Connection<Model, Msg>
}

/**
 * Gets a _Redux DevTool Extension_ connection in case the extension is available
 * @category utils
 * @since 0.5.0
 */
export const getConnection =
  <Model, Msg>(global: Global): IO.IO<Option.Option<Connection<Model, Msg>>> =>
  () => {
    return hasExtension(global)
      ? Option.Some(global.__REDUX_DEVTOOLS_EXTENSION__.connect())
      : Option.None
  }

/**
 * **[UNSAFE]** Type guard to check if _Redux DevTool Extension_ is available.
 *
 * This is "tagged" as unsafe because the check is really loose.
 * @since 0.5.0
 */
const hasExtension = (
  global: Global,
): global is Global & { __REDUX_DEVTOOLS_EXTENSION__: Extension } => {
  return "__REDUX_DEVTOOLS_EXTENSION__" in global
}

/**
 * **[UNSAFE]** Debug through _Redux DevTool Extension_
 * @category constructors
 * @since 0.5.4
 */
export const makeDebugger = <Model, Msg>(
  connection: Connection<Model, Msg>,
): Debugger<Model, Msg> => {
  return (d) => {
    const deps = { ...d, connection }

    // --- Subscribe to extension in order to receive messages from monitor
    connection.subscribe(handleSubscription(deps))

    return {
      debug: handleActions(deps),
      stop: connection.unsubscribe,
    }
  }
}

/**
 * **[UNSAFE]** Handles the execution of an effect related to an incoming messages sent from extension monitor.
 * @since 0.5.0
 */
function handleSubscription<Model, Msg>(
  deps: DevToolHandlerR<Model, Msg>,
): (msg: DevToolMsg) => void {
  const handler = handleIncomingMsg(deps)

  return (msg) =>
    pipe(
      handler(msg),
      Result.fold(
        (err) => console.warn("[REDUX DEV TOOL]", err),
        (eff) => eff(),
      ),
    )
}

/**
 * **[UNSAFE]** Handles incoming messages sent from extension monitor.
 *
 * This is largely inspired by https://github.com/zalmoxisus/mobx-remotedev/blob/master/src/monitorActions.js
 *
 * **Note:** the monitor can dispatch messages of any shape that will be re-dispatched into the application; these messages **are not validated** and can lead to unexpected behaviours.
 * @since 0.5.0
 */
function handleIncomingMsg<Model, Msg>({
  connection,
  init,
  debug$,
  dispatch,
}: DevToolHandlerR<Model, Msg>): (
  msg: DevToolMsg,
) => Result.Result<string, IO.IO<void>> {
  const dispatchToApp =
    (m: unknown): IO.IO<void> =>
    () =>
      dispatch(m as Msg)

  const reinit: IO.IO<void> = () => connection.init(init)

  const update = (payload: Model): IO.IO<void> =>
    dispatchToApp({ type: "__DebugUpdateModel__", payload })

  const restart =
    (model: Model): IO.IO<void> =>
    () =>
      connection.init(model)

  const liftState =
    (state: LiftedState<Model>): IO.IO<void> =>
    () =>
      connection.send(null, state)

  const toggle = toggleAction(dispatch)

  return (msg) => {
    switch (msg.type) {
      case "START":
        return Result.Ok(reinit)

      case "ACTION": {
        const result = Json.parse(String(msg.payload))
        switch (result.type) {
          case "Err":
            return Result.Err(result.error.message)

          case "Ok":
            return Result.Ok(dispatchToApp(result.value))
        }
      }

      case "DISPATCH":
        switch (msg.payload.type) {
          case "JUMP_TO_STATE":
          case "JUMP_TO_ACTION":
            return pipe(parseJump<Model>(msg), Result.map(update))

          case "RESET":
            return Result.Ok(
              pipe(
                update(init),
                IO.chain(() => reinit),
              ),
            )

          case "ROLLBACK":
            return pipe(
              parseRollback<Model>(msg),
              Result.map((m) =>
                pipe(
                  update(m),
                  IO.chain(() => restart(m)),
                ),
              ),
            )

          case "COMMIT":
            return Result.Ok(restart(debug$.getValue()[1]))

          case "IMPORT_STATE":
            return pipe(
              parseImportState<Model>(msg),
              Result.map((liftedState) =>
                pipe(
                  update(
                    // @ts-ignore
                    liftedState.computedStates[
                      liftedState.computedStates.length - 1
                    ].state,
                  ),
                  IO.chain(() => liftState(liftedState)),
                ),
              ),
            )

          case "TOGGLE_ACTION":
            return pipe(
              parseToggleAction<Model>(msg),
              Result.map(([id, liftedState]) =>
                pipe(toggle(id, liftedState), IO.chain(liftState)),
              ),
            )

          default:
            return Result.Err(msg.payload.type)
        }
    }
  }
}

/**
 * Handles debugging actions.
 *
 * The `MESSAGE` action will send the message payload and state to the connected extension (`connection`).
 * @since 0.5.0
 */
function handleActions<Model, Msg>({
  connection,
}: DevToolHandlerR<Model, Msg>): Debug<Model, Msg> {
  return ([action, model]) =>
    action.type === "MESSAGE"
      ? connection.send(action.payload, model)
      : undefined
}

/**
 * Parses a `JUMP` message.
 *
 * @since 0.5.0
 */
function parseJump<Model>(msg: Monitor): Result.Result<string, Model> {
  return pipe(
    Json.parse(String(msg.state)),
    Result.mapError((problem) => problem.message),
    Result.map(
      (value) =>
        // @ts-ignore
        value as Model,
    ),
  )
}

/**
 * Parses a `ROLLBACK` message.
 *
 * @since 0.5.0
 */
function parseRollback<Model>(msg: Monitor): Result.Result<string, Model> {
  return pipe(
    Json.parse(String(msg.state)),
    Result.mapError((problem) => problem.message),
    Result.map(
      (u) =>
        // @ts-ignore
        u as Model,
    ),
  )
}

/**
 * Parses an `IMPORT_STATE` message.
 *
 * @since 0.5.0
 */
function parseImportState<Model>(
  msg: Monitor,
): Result.Result<string, LiftedState<Model>> {
  return typeof msg.payload.nextLiftedState === "object" &&
    msg.payload.nextLiftedState !== null
    ? Result.Ok(msg.payload.nextLiftedState as LiftedState<Model>)
    : Result.Err("IMPORT_STATE message has some bad payload...")
}

/**
 * Parses a `TOGGLE_ACTION` message.
 *
 * @since 0.5.0
 */
function parseToggleAction<Model>(
  msg: Monitor,
): Result.Result<string, [number, LiftedState<Model>]> {
  const getId = pipe(
    msg.payload.id,
    Result.fromNullable("TOGGLE_ACTION message has some bad payload..."),
    Result.map((x) => x as number),
  )

  if (getId.type === "Err") {
    return getId
  }

  const parseState = pipe(
    Json.parse(String(msg.state)),
    Result.map(
      // @ts-ignore
      (u) => u as LiftedState<Model>,
    ),
    Result.mapError((problem) => problem.message),
  )

  if (parseState.type === "Err") {
    return parseState
  }

  return Result.Ok([getId.value, parseState.value])
}

/**
 * Handles toggling a specific action (identified by `id` parameter).
 *
 * It re-executes all the actions (and updates the store) excluding the toggled one.
 *
 * The implementation is taken from [MobX dev tool integration](https://github.com/zalmoxisus/mobx-remotedev/blob/master/src/monitorActions.js#L22)
 *
 * @since 0.5.0
 */
function toggleAction<Model, Msg>(
  dispatch: Dispatch<MsgWithDebug<Model, Msg>>,
): (id: number, liftedState: LiftedState<Model>) => IO.IO<LiftedState<Model>> {
  return (id, liftedState) => () => {
    const state = JSON.parse(JSON.stringify(liftedState)) // poor man deep clone...

    const { skippedActionIds, stagedActionIds, computedStates, actionsById } =
      state

    const skippedIndex = skippedActionIds.indexOf(id)
    const skipped = skippedIndex !== -1
    const actionIndex = stagedActionIds.indexOf(id)

    if (actionIndex === -1) {
      return state
    }

    dispatch({
      type: "__DebugUpdateModel__",
      payload: computedStates[actionIndex - 1].state,
    })

    const start = skipped ? actionIndex : actionIndex + 1
    const end = stagedActionIds.length

    for (let i = start; i < end; i++) {
      const currentActionId = stagedActionIds[i]

      if (
        i !== actionIndex &&
        skippedActionIds.indexOf(currentActionId) !== -1
      ) {
        continue // it's already skipped
      }

      dispatch({
        type: "__DebugApplyMsg__",
        payload: actionsById[currentActionId].action,
      })
    }

    if (skipped) {
      skippedActionIds.splice(skippedIndex, 1)
    } else {
      skippedActionIds.push(id)
    }

    return state
  }
}
