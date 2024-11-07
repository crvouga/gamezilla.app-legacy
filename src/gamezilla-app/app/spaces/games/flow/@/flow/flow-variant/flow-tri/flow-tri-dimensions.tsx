import { p } from '@/core/parser'

export const Model = p.obj({
  t: p.l('flow-tri'),
  side: p.num
})

export type Model = p.Infer<typeof Model>

export const init = (input: { side: number }): Model => {
  return {
    t: 'flow-tri',
    side: input.side
  }
}

export const ViewForm = (_input: { form: Model; onInput: (dimensions: Model) => void }) => {
  return <>flow tri dimensions form</>
}
