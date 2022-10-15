import * as Cmd from "./Cmd"
import { p } from "./pipe"
import * as Sub from "./Sub"

export const exhaustive = (
  discriminatedUnionType: "Missing Cases Error",
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

      return p(
        [modelNew, Cmd.batch([cmdPrev, cmdNew])],
        andThenMany(update, msgsRest),
      )
    }

export const t =
  <Tag extends string>(tag: Tag) =>
    <Value>(value: Value): [Tag, Value] =>
      [tag, value]

export const tagUpdate = <TagName extends string, Model, Msg>(
  tagName: TagName,
  [model, cmd]: [Model, Cmd.Cmd<Msg>],
): [[TagName, Model], Cmd.Cmd<[TagName, Msg]>] => {
  return [
    [tagName, model],
    p(
      cmd,
      Cmd.map((msg) => [tagName, msg]),
    ),
  ]
}

export const tagCmd = <TagName extends string, Msg>(
  tagName: TagName,
  cmd: Cmd.Cmd<Msg>,
): Cmd.Cmd<[TagName, Msg]> => {
  return p(
    cmd,
    Cmd.map((msg) => [tagName, msg]),
  )
}

export const tagSub = <TagName extends string, Msg>(
  tagName: TagName,
  sub: Sub.Sub<Msg>,
): Sub.Sub<[TagName, Msg]> => {
  return p(
    sub,
    Sub.map((msg) => [tagName, msg]),
  )
}

export type Unit = { type: "Unit" }

export const Unit: Unit = { type: "Unit" }

type Range = [number, number]

export const rescale = ({
  value,
  from,
  to,
}: {
  value: number
  from: Range
  to: Range
}) => {
  return ((value - from[0]) * (to[1] - to[0])) / (from[1] - from[0]) + to[0]
}
