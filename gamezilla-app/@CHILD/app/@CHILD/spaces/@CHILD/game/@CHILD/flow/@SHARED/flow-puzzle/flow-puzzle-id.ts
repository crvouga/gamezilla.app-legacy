import { err, ok, Result, Uuid } from "gamezilla-app/@SHARED/core"

export type FlowPuzzleId = string & { _opaque: "FlowPuzzleId" }
const namespace = "flow-puzzle"
const separator = ":"

const is = (flowPuzzleId: unknown): flowPuzzleId is FlowPuzzleId => {
  return typeof flowPuzzleId === "string"
}

type Problem = "invalid_id"

const parse = (id: unknown): Result<Problem, FlowPuzzleId> => {
  if (is(id)) {
    return ok(id)
  }
  return err("invalid_id")
}

const generate = () => {
  const id = Uuid.generate()
  const flowPuzzleId = `${namespace}${separator}${id}`

  if (is(flowPuzzleId)) {
    return flowPuzzleId
  }

  throw new Error("impossible condition. generated invalid id.")
}

export const FlowPuzzleId = {
  generate,
  parse,
  is,
}
