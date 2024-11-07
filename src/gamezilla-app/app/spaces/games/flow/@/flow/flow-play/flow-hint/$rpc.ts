import { p } from '@/core/parser'
import { initContract, attachServer } from '@/rpc/rpc'
import { FlowVariant } from '../../flow-variant'
import { Flow } from '../../flow'

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

export const rpc = attachServer(contract, {
  findSolutions: async (input) => {
    console.log('findSolutions', input)
    return {
      solutions: []
    }
  }
})
