import { Uuid } from 'gamezilla-app/@/core'
import { p } from 'gamezilla-app/@/core/parser'

const parser = p.brand(p.str, 'FlowPackId')

export type FlowPackId = p.Infer<typeof parser>

const generate = () => {
  return `flow-pack:${Uuid.generate()}` as FlowPackId
}

const is = (flowPackId: unknown): flowPackId is FlowPackId => {
  return typeof flowPackId === 'string'
}

export const FlowPackId = {
  ...parser,
  is,
  generate
}
