import * as Cmd from "./Cmd"
import { pipe } from "./pipe"
import * as Sub from "./Sub"

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

export const tagUpdate = <TagName extends string, Model, Msg>(
  tagName: TagName,
  [model, cmd]: [Model, Cmd.Cmd<Msg>],
): [[TagName, Model], Cmd.Cmd<[TagName, Msg]>] => {
  return [
    [tagName, model],
    pipe(
      cmd,
      Cmd.map((msg) => [tagName, msg]),
    ),
  ]
}

export const tagCmd = <TagName extends string, Msg>(
  tagName: TagName,
  cmd: Cmd.Cmd<Msg>,
): Cmd.Cmd<[TagName, Msg]> => {
  return pipe(
    cmd,
    Cmd.map((msg) => [tagName, msg]),
  )
}

export const tagSub = <TagName extends string, Msg>(
  tagName: TagName,
  sub: Sub.Sub<Msg>,
): Sub.Sub<[TagName, Msg]> => {
  return pipe(
    sub,
    Sub.map((msg) => [tagName, msg]),
  )
}

export type Unit = { type: "Unit" }

export const Unit: Unit = { type: "Unit" }
