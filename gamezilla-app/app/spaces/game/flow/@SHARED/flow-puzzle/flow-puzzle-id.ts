import { Uuid } from "gamezilla-app/@shared/core"
import { Brand } from "gamezilla-app/@shared/core/brand"
import { p } from "gamezilla-app/@shared/core/parser"

export type FlowPuzzleId = Brand<string, "FlowPuzzleId">

const namespace = "flow-puzzle"
const separator = ":"

const is = (flowPuzzleId: unknown): flowPuzzleId is FlowPuzzleId => {
  return typeof flowPuzzleId === "string"
}

const parser = p.custom(is, "Invalid flow puzzle id")

const generate = () => {
  const id = Uuid.generate()
  const flowPuzzleId = `${namespace}${separator}${id}`

  if (is(flowPuzzleId)) {
    return flowPuzzleId
  }

  throw new Error("impossible condition. generated invalid id.")
}

export const FlowPuzzleId = {
  ...parser,
  generate,

  is,
}
