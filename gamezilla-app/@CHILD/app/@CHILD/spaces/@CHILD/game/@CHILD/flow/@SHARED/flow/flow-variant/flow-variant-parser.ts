import * as FlowVariant from "./flow-variant"

const is = (_x: unknown): _x is FlowVariant.Model => {
  return false
}

export const FlowVariantParser = {
  is,
}
