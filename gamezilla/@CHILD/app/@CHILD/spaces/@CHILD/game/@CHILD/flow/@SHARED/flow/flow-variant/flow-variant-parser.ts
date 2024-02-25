import * as FlowVariant from "./flow-variant"

const is = (_x: unknown): _x is FlowVariant.Model => {
  // @ts-ignore
  return true
}

export const FlowVariantParser = {
  is,
}
