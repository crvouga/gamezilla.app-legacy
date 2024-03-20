import { err, ok, Result, Uuid } from "gamezilla-app/@SHARED/core"
import { Brand } from "gamezilla-app/@SHARED/core/brand"
import { z } from "zod"

export type FlowPuzzleId = Brand<string, "FlowPuzzleId">

const namespace = "flow-puzzle"
const separator = ":"

const is = (flowPuzzleId: unknown): flowPuzzleId is FlowPuzzleId => {
  return typeof flowPuzzleId === "string"
}

export const ZFlowPuzzleId = z.string().refine(is)

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
