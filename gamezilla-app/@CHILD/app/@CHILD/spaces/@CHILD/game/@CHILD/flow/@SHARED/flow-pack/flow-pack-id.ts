import { Uuid } from "gamezilla-app/@SHARED/core"

export type FlowPackId = string & { __brand: "FlowPackId" }

const generate = () => {
  return `flow-pack:${Uuid.generate()}` as FlowPackId
}

const is = (flowPackId: unknown): flowPackId is FlowPackId => {
  return typeof flowPackId === "string"
}

export const FlowPackId = {
  is,
  generate,
}
