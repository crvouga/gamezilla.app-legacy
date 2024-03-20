import { z } from "zod"
import * as FlowEditUI from "./flow-variant-ui-edit"
import * as FlowZod from "../flow/flow.zod"
import * as FlowVariantDimensionsZod from "./flow-variant-dimensions.zod"

export const Msg: z.ZodType<FlowEditUI.Msg> = z.discriminatedUnion("t", [
  z.object({
    t: z.literal("dragged-over"),
    nodeId: FlowZod.NodeId,
  }),
  z.object({
    t: z.literal("pressed-up-node"),
    nodeId: FlowZod.NodeId,
  }),
  z.object({
    t: z.literal("pressed-down-node"),
    nodeId: FlowZod.NodeId,
  }),
  z.object({
    t: z.literal("clicked-clear"),
  }),
  z.object({
    t: z.literal("clicked-undo"),
  }),
  z.object({
    t: z.literal("clicked-redo"),
  }),
  //
  z.object({
    t: z.literal("dimensions-form.clicked-open"),
  }),
  z.object({
    t: z.literal("dimensions-form.closed"),
  }),
  z.object({
    t: z.literal("dimensions-form.clicked-cancel"),
  }),
  z.object({
    t: z.literal("dimensions-form.clicked-save"),
  }),
  z.object({
    t: z.literal("dimensions-form.inputted"),
    dimensions: FlowVariantDimensionsZod.Model,
  }),
])
