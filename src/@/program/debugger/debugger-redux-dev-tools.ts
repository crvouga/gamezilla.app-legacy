/**
 * Integration with _Redux DevTool Extension_.
 *
 * Please check the [docs](https://github.com/zalmoxisus/redux-dev-tools-extension/tree/master/docs/API) fur further information.
 *
 * @since 0.5.0
 */

import { IO, isErr, Result } from '~/@/core'
import { Msg } from '~/@/msg/msg'
import { pipe } from '../../function/pipe'
import { Json } from '../../json/json'
import { ProgramDebugger } from '../program'
import type { Debug, Debugger, DebuggerDeps, Global, MsgWithDebug } from './debugger'

type Unsubscribe = () => void

/**
 * Defines a _Redux DevTool Extension_ object.
 * @category model
 * @since 0.5.0
 */
export interface ReduxDevToolsBrowserExtension {
  connect: <Model, Msg extends object>() => ReduxDevToolsConnection<Model, Msg>
}

/**
 * Defines a _Redux DevTool Extension_ connection object.
 * @category model
 * @since 0.5.0
 */
export interface ReduxDevToolsConnection<Model, Msg extends Record<string, any>> {
  subscribe: (listener?: (m: DevToolMsg) => void) => Unsubscribe
  send(action: null, state: LiftedState<Model>): void
  send(action: Msg, state: Model): void
  init: (state: Model) => void
  error: (message: unknown) => void
  unsubscribe: () => void
}

type DevToolMsg = Start | Action | Monitor

interface Start {
  type: 'START'
}

interface Action {
  type: 'ACTION'
  payload: unknown
}

interface Monitor {
  type: 'DISPATCH'
  payload: {
    type: 'JUMP_TO_STATE' | 'JUMP_TO_ACTION' | 'RESET' | 'ROLLBACK' | 'COMMIT' | 'IMPORT_STATE' | 'TOGGLE_ACTION'
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

interface DevToolHandlerR<Model, Msg extends object> extends DebuggerDeps<Model, Msg> {
  connection: ReduxDevToolsConnection<Model, Msg>
}

/**
 * Gets a _Redux DevTool Extension_ connection in case the extension is available
 * @category utils
 * @since 0.5.0
 */
export const getBrowserExtensionConnection = <Model, Msg extends object>(
  global: Global
): ReduxDevToolsConnection<Model, Msg> | null => {
  if (
    '__REDUX_DEVTOOLS_EXTENSION_COMPOSE__' in global &&
    typeof global.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ === 'function'
  ) {
    // https://github.com/reduxjs/redux-devtools/tree/main/packages/redux-devtools-instrument#api
    global.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__({
      maxAge: 1
    })
  }

  return hasExtension(global)
    ? // @ts-ignore
      global.__REDUX_DEVTOOLS_EXTENSION__.connect<Model, Msg>()
    : null
}

/**
 * **[UNSAFE]** Type guard to check if _Redux DevTool Extension_ is available.
 *
 * This is "tagged" as unsafe because the check is really loose.
 * @since 0.5.0
 */
const hasExtension = (
  global: Global
): global is Global & {
  __REDUX_DEVTOOLS_EXTENSION__: ReduxDevToolsBrowserExtension
} => {
  return '__REDUX_DEVTOOLS_EXTENSION__' in global
}

/**
 * **[UNSAFE]** Debug through _Redux DevTool Extension_
 * @category constructors
 * @since 0.5.4
 */
export const makeDebugger = <Model, Msg extends object>(
  connection: ReduxDevToolsConnection<Model, Msg>
): Debugger<Model, Msg> => {
  return (d) => {
    const deps = { ...d, connection }

    // --- Subscribe to extension in order to receive messages from monitor
    connection.subscribe(handleSubscription(deps))

    return {
      debug: handleActions(deps),
      stop: connection.unsubscribe
    }
  }
}

/**
 * **[UNSAFE]** Handles the execution of an effect related to an incoming messages sent from extension monitor.
 * @since 0.5.0
 */
const handleSubscription = <Model, Msg extends object>(
  deps: DevToolHandlerR<Model, Msg>
): ((msg: DevToolMsg) => void) => {
  const handler = handleIncomingMsg(deps)

  return (msg) => {
    const result = handler(msg)
    if (isErr(result)) {
      // console.warn('[REDUX DEV TOOL]', result.error)
      return
    }
    result.value()
  }
}

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
  dispatch
}: DevToolHandlerR<Model, Msg>): ((msg: DevToolMsg) => Result<string, IO<void>>) => {
  const dispatchToApp =
    (m: unknown): IO<void> =>
    async () =>
      dispatch(m as Msg)

  const reInit: IO<void> = async () => connection.init(init)

  const update = (payload: Model): IO<void> =>
    dispatchToApp({
      type: '__DebugUpdateModel__',
      payload
    })

  const restart =
    (model: Model): IO<void> =>
    async () =>
      connection.init(model)

  const liftState =
    (state: LiftedState<Model>): IO<void> =>
    async () =>
      connection.send(null, state)

  const toggle = toggleAction(dispatch)

  return (msg) => {
    switch (msg.type) {
      case 'START':
        return Result.Ok(reInit)

      case 'ACTION': {
        const result = Json.parse(String(msg.payload))
        switch (result.t) {
          case 'err':
            return Result.Err(result.error.message)

          case 'ok':
            return Result.Ok(dispatchToApp(result.value))
        }
      }

      case 'DISPATCH':
        switch (msg.payload.type) {
          case 'JUMP_TO_STATE':
            return pipe(parseJump<Model>(msg), (x) => Result.mapOk(x, update))

          case 'JUMP_TO_ACTION':
            return pipe(parseJump<Model>(msg), (x) => Result.mapOk(x, update))

          case 'RESET':
            return Result.Ok(
              pipe(
                update(init),
                IO.chain(() => reInit)
              )
            )

          case 'ROLLBACK':
            return pipe(parseRollback<Model>(msg), (x) =>
              Result.mapOk(x, (m) =>
                pipe(
                  update(m),
                  IO.chain(() => restart(m))
                )
              )
            )

          case 'COMMIT':
            // return Result.Ok(restart(debug$.getValue()[1]));
            return Result.Err('idk')

          case 'IMPORT_STATE':
            return pipe(parseImportState<Model>(msg), (x) =>
              Result.mapOk(x, (liftedState) =>
                pipe(
                  update(
                    // @ts-ignore
                    liftedState.computedStates[liftedState.computedStates.length - 1].state
                  ),
                  IO.chain(() => liftState(liftedState))
                )
              )
            )

          case 'TOGGLE_ACTION':
            return pipe(parseToggleAction<Model>(msg), (x) =>
              Result.mapOk(x, ([id, liftedState]) => pipe(toggle(id, liftedState), IO.chain(liftState)))
            )

          default:
            return Result.Err(msg.payload.type)
        }

      default:
        return Result.Err(`unhandled case: ${Result.unwrapOr(Json.stringify(msg), 'unknown')}`)
    }
  }
}

/**
 * Handles debugging actions.
 *
 * The `MESSAGE` action will send the message payload and state to the connected extension (`connection`).
 * @since 0.5.0
 */
const handleActions = <Model, Msg extends object>({ connection }: DevToolHandlerR<Model, Msg>): Debug<Model, Msg> => {
  return ([action, model]) => (action.type === 'MESSAGE' ? connection.send(action.payload, model) : undefined)
}

/**
 * Parses a `JUMP` message.
 *
 * @since 0.5.0
 */
const parseJump = <Model>(msg: Monitor): Result<string, Model> => {
  return pipe(
    Json.parse(String(msg['state'])),
    (_) => Result.mapErr(_, (problem) => problem.message),
    (x) =>
      Result.mapOk(
        x,
        (value) =>
          // @ts-ignore
          value as Model
      )
  )
}

/**
 * Parses a `ROLLBACK` message.
 *
 * @since 0.5.0
 */
const parseRollback = <Model>(msg: Monitor): Result<string, Model> => {
  return pipe(
    Json.parse(String(msg['state'])),
    (_) => Result.mapErr(_, (problem) => problem.message),
    (x) =>
      Result.mapOk(
        x,
        (u) =>
          // @ts-ignore
          u as Model
      )
  )
}

/**
 * Parses an `IMPORT_STATE` message.
 *
 * @since 0.5.0
 */
const parseImportState = <Model>(msg: Monitor): Result<string, LiftedState<Model>> => {
  return typeof msg.payload['nextLiftedState'] === 'object' && msg.payload['nextLiftedState'] !== null
    ? Result.Ok(msg.payload['nextLiftedState'] as LiftedState<Model>)
    : Result.Err('IMPORT_STATE message has some bad payload...')
}

/**
 * Parses a `TOGGLE_ACTION` message.
 *
 * @since 0.5.0
 */
const parseToggleAction = <Model>(msg: Monitor): Result<string, [number, LiftedState<Model>]> => {
  const getId = pipe(msg.payload['id'], Result.fromNullable('TOGGLE_ACTION message has some bad payload...'), (_) =>
    Result.mapOk(_, (x) => x as number)
  )

  if (getId.t === 'err') {
    return getId
  }

  const parseState = pipe(
    Json.parse(String(msg['state'])),
    (_) =>
      Result.mapOk(
        _,
        // @ts-ignore
        (u) => u as LiftedState<Model>
      ),
    (_) => Result.mapErr(_, (problem) => problem.message)
  )

  if (parseState.t === 'err') {
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

const toggleAction =
  <Model, Msg extends object>(dispatch: (m: MsgWithDebug<Model, Msg>) => void) =>
  (id: number, liftedState: LiftedState<Model>): IO<LiftedState<Model>> =>
  async () => {
    const state = unsafeCopy(liftedState)

    const { skippedActionIds, stagedActionIds, computedStates, actionsById } = state

    const skippedIndex = skippedActionIds.indexOf(id)
    const skipped = skippedIndex !== -1
    const actionIndex = stagedActionIds.indexOf(id)

    if (actionIndex === -1) {
      return state
    }

    dispatch({
      type: '__DebugUpdateModel__',
      // @ts-ignore
      payload: computedStates[actionIndex - 1].state
    })

    const start = skipped ? actionIndex : actionIndex + 1
    const end = stagedActionIds.length

    for (let i = start; i < end; i++) {
      const currentActionId = stagedActionIds[i]

      if (i !== actionIndex && currentActionId && skippedActionIds.indexOf(currentActionId) !== -1) {
        continue // it's already skipped
      }

      if (currentActionId) {
        dispatch({
          type: '__DebugApplyMsg__',
          // @ts-ignore
          payload: actionsById[currentActionId].action
        })
      }
    }

    if (skipped) {
      skippedActionIds.splice(skippedIndex, 1)
    } else {
      skippedActionIds.push(id)
    }

    return state
  }

// poor man deep clone...
const unsafeCopy = <A>(a: A): A => {
  return JSON.parse(JSON.stringify(a))
}

export const DebuggerReduxDevTools: ProgramDebugger = async (initialModel, setModel) => {
  const connection = getBrowserExtensionConnection<any, any>(window)

  if (!connection) {
    return function updateDebugger(_model: any, _msg: any) {
      return
    }
  }

  connection.subscribe(function devToolsConnectionSubscriber(msg: DevToolMsg) {
    switch (msg.type) {
      case 'ACTION': {
        return
      }
      case 'DISPATCH': {
        return
      }
      case 'START': {
        return
      }
    }
  })

  const Debugger = makeDebugger<any, any>(connection)

  Debugger({
    init: initialModel,
    dispatch(msg) {
      switch (msg['type']) {
        case '__DebugApplyMsg__': {
          return
        }
        case '__DebugStarted__': {
          return
        }
        case '__DebugUpdateModel__': {
          setModel(msg['payload'])
          return
        }
      }
    }
  })

  const rateLimits = new Map<
    string,
    {
      lastReset: number
      count: number
    }
  >()
  const blockList = new Set<string>()
  const TIME_LIMIT = 1000
  const COUNT_LIMIT = 10

  return function updateDebugger(model: any, msg: any) {
    const actionType = Msg.toType(msg)

    if (blockList.has(actionType)) {
      return
    }

    if (!rateLimits.has(actionType)) {
      rateLimits.set(actionType, {
        lastReset: Date.now(),
        count: 1
      })
    }

    const rateLimit = rateLimits.get(actionType)!

    const timeElapsed = Date.now() - rateLimit.lastReset

    if (timeElapsed < TIME_LIMIT) {
      rateLimit.count++
    }

    if (rateLimit.count > COUNT_LIMIT) {
      blockList.add(actionType)
      console.log(`[debugger] action type \`${actionType}\` has be blocked due to high frequency`)
      return
    }

    const action = {
      type: actionType,
      payload: Msg.toPayload(msg, {})
    }

    connection.send(action, model)
  }
}
