import * as Rx from "rxjs"
import * as Option from "./Option"
import * as Task from "./Task"
import { pipe } from "./pipe"

export type Cmd<Msg> = Rx.Observable<Task.Task<Option.Option<Msg>>>

export const of = <Msg>(m: Msg): Cmd<Msg> => {
  return Rx.of(Task.of(Option.Some(m)))
}

export const map =
  <A, B>(mapper: (a: A) => B) =>
  (Cmd: Cmd<A>) => {
    return Cmd.pipe(Rx.map(Task.map(Option.map(mapper))))
  }

export const batch = <Msg>(cmds: Cmd<Msg>[]): Cmd<Msg> => {
  return Rx.merge(...cmds)
}

export const None: Cmd<never> = Rx.EMPTY

export const fromTask =
  <A, Msg>(f: (a: A) => Msg) =>
  (task: Task.Task<A>): Cmd<Msg> => {
    return pipe(task, Task.map(f), Task.map(Option.Some), Rx.of)
  }
