import { p } from "gamezilla-app/@/core/parser"

export const Model = p.obj({
  t: p.l("flow-hex"),
  width: p.num,
  height: p.num,
  side: p.num,
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
