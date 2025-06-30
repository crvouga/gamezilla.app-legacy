import { Brand } from '../brand/brand'
import { ShortId } from '../id/short-id'

export type TraceId = Brand<string, 'TraceId'>

const generate = (): TraceId => {
  return `trace_id_${ShortId.generate(12)}` as TraceId
}

export const TraceId = {
  generate,
}
