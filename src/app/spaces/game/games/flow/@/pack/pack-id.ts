import { Uuid } from '~/@/uuid/uuid'
import { p } from '~/@/parser'

const parser = p.brand(p.str, 'PackId')

export type PackId = p.Infer<typeof parser>

const generate = () => {
  return `flow-pack:${Uuid.generate()}` as PackId
}

const is = (flowPackId: unknown): flowPackId is PackId => {
  return typeof flowPackId === 'string'
}

export const PackId = {
  ...parser,
  is,
  generate,
}
