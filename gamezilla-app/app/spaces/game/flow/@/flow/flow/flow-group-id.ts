import { p } from 'gamezilla-app/@/core/parser'

const ORDER = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q'] as const

const parser = p.enumeration(ORDER)

export type FlowGroupId = p.Infer<typeof parser>

const is = (groupId: unknown): groupId is FlowGroupId => {
  return parser.parse(groupId).t === 'ok'
}

export const FlowGroupId = {
  ...parser,
  ORDER,
  is
}
