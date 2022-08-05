import * as Cmd from "./Cmd"
import { pipe } from "./pipe"

export const exhaustive = (
  discriminatedUnionType: "Missing Case Error",
): never => {
  throw new Error(`Missing case for: ${discriminatedUnionType}`)
}

export const andThen =
  <Msg, Model>(
    update: (msg: Msg, model: Model) => [Model, Cmd.Cmd<Msg>],
    msg: Msg,
  ) =>
  ([model, cmdPrev]: [Model, Cmd.Cmd<Msg>]): [Model, Cmd.Cmd<Msg>] => {
    const [modelNew, cmdNew] = update(msg, model)

    return [modelNew, Cmd.batch([cmdNew, cmdPrev])]
  }

export const andThenMany =
  <Action, Model, Msg>(
    update: (msg: Action, model: Model) => [Model, Cmd.Cmd<Msg>],
    msgs: Action[],
  ) =>
  ([modelPrev, cmdPrev]: [Model, Cmd.Cmd<Msg>]): [Model, Cmd.Cmd<Msg>] => {
    const [msg, ...msgsRest] = msgs

    if (!msg) {
      return [modelPrev, cmdPrev]
    }

    const [modelNew, cmdNew] = update(msg, modelPrev)

    return pipe(
      [modelNew, Cmd.batch([cmdPrev, cmdNew])],
      andThenMany(update, msgsRest),
    )
  }

export const tag =
  <Tag extends string>(tag: Tag) =>
  <Value>(value: Value): [Tag, Value] =>
    [tag, value]

export type Unit = { type: "Unit" }

export const Unit: Unit = { type: "Unit" }
