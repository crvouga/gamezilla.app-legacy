/**
 * Handles the execution of asynchronous effectful operations.
 *
 * See the [Task](https://package.elm-lang.org/packages/elm/core/latest/Task) Elm package.
 *
 * @since 0.5.0
 */

import { Either } from "fp-ts/lib/Either"
import { pipe } from "fp-ts/lib/function"
import * as Option from "fp-ts/lib/Option"
import * as Task from "fp-ts/lib/Task"
import * as Rx from "rxjs"
import { Cmd } from "./Cmd"

/**
 * Executes a `Task` as a `Cmd` mapping the result to a `Msg`.
 * @category utils
 * @since 0.5.0
 */
export const perform =
  <A, Msg>(f: (a: A) => Msg) =>
  (task: Task.Task<A>): Cmd<Msg> => {
    return pipe(task, Task.map(f), Task.map(Option.some), Rx.of)
  }

/**
 * Executes a `Task` that can fail as a `Cmd` mapping the result (`Either`) to a `Msg`.
 * @category utils
 * @since 0.5.0
 */
export function attempt<E, A, Msg>(
  f: (e: Either<E, A>) => Msg,
): (task: Task.Task<Either<E, A>>) => Cmd<Msg> {
  return perform(f)
}
