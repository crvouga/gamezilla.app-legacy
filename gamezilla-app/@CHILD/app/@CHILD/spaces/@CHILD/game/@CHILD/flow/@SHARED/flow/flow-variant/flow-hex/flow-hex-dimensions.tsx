import { z } from "zod"

export const Model = z.object({
  t: z.literal("flow-hex"),
  width: z.number(),
  height: z.number(),
  side: z.number(),
})

export type Model = {
  t: "flow-hex"
  width: number
  height: number
  side: number
}

export const init = (input: {
  width: number
  height: number
  side: number
}): Model => {
  return {
    t: "flow-hex",
    width: input.width,
    height: input.height,
    side: input.side,
  }
}

export const ViewForm = (_input: {
  form: Model
  onInput: (dimensions: Model) => void
}) => {
  return <>flow hex dimensions form</>
}
