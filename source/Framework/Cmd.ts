/**
 * Defines `Cmd`s as streams of asynchronous operations which can not fail and that can optionally carry a message.
 *
 * See the [Platform.Cmd](https://package.elm-lang.org/packages/elm/core/latest/Platform-Cmd) Elm package.
 *
 * @since 0.5.0
 */

import * as Option from "fp-ts/lib/Option";
import * as Task from "fp-ts/lib/Task";
import * as Rx from "rxjs";

/**
 * @category model
 * @since 0.5.0
 */
export interface Cmd<Msg>
  extends Rx.Observable<Task.Task<Option.Option<Msg>>> {}

/**
 * Creates a new `Cmd` that carries the provided `Msg`.
 * @category Applicative
 * @since 0.5.0
 */
export function of<Msg>(m: Msg): Cmd<Msg> {
  return Rx.of(Task.of(Option.some(m)));
}

/**
 * Maps the carried `Msg` of a `Cmd` into another `Msg`.
 * @category Functor
 * @since 0.5.0
 */
export const map =
  <A, B>(mapper: (a: A) => B) =>
  (cmd: Cmd<A>) => {
    return cmd.pipe(Rx.map(Task.map(Option.map(mapper))));
  };

/**
 * Batches the execution of a list of commands.
 * @category utils
 * @since 0.5.0
 */
export function batch<Msg>(arr: Array<Cmd<Msg>>): Cmd<Msg> {
  return Rx.merge(...arr);
}

/**
 * A `none` command is an empty stream.
 * @category constructors
 * @since 0.5.0
 */
export const none: Cmd<never> = Rx.EMPTY;
