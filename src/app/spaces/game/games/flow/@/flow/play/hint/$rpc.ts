import { p } from '~/@/parser'
import { initContract } from '~/@/rpc/rpc'
import { Flow } from '../../flow'
import { Variant } from '../../variant'

export const contract = initContract({
  findSolutions: {
    input: p.obj({
      flow: Variant.Model,
    }),
    output: p.obj({
      solutions: p.arr(Flow.Model),
    }),
  },
})
