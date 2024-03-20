import { FlowHexDimensions } from "./flow-hex"
import { FlowGridDimensions } from "./flow-grid"
import { FlowTriDimensions } from "./flow-tri"
import { z } from "zod"
import * as FlowVariantDimensions from "./flow-variant-dimensions"

export const Model: z.ZodType<FlowVariantDimensions.Model> =
  z.discriminatedUnion("t", [
    FlowGridDimensions.Model,
    FlowHexDimensions.Model,
    FlowTriDimensions.Model,
  ])
