import { s } from '~/@/schema'

export const Model = s.obj({
  t: s.l('flow-tri'),
  side: s.num(),
})

export type Model = s.Infer<typeof Model>

export const init = (input: { side: number }): Model => {
  return {
    t: 'flow-tri',
    side: input.side,
  }
}

export const ViewForm = (_input: { form: Model; onInput: (dimensions: Model) => void }) => {
  return <>flow tri dimensions form</>
}
