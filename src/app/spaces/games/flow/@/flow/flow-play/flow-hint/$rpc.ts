import { p } from '@/core/parser'
import { initContract } from '@/rpc/rpc'
import { Flow } from '../../flow'
import { FlowVariant } from '../../flow-variant'

export const contract = initContract({
  findSolutions: {
    input: p.obj({
      flow: FlowVariant.Model
    }),
    output: p.obj({
      solutions: p.arr(Flow.Model)
    })
  }
})
