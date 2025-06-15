import { s } from '~/@/schema'

export const Model = s.obj({
  t: s.l('hex'),
  width: s.num(),
  height: s.num(),
  side: s.num(),
})

export type Model = {
  t: 'hex'
  width: number
  height: number
  side: number
}

export const init = (input: { width: number; height: number; side: number }): Model => {
  return {
    t: 'hex',
    width: input.width,
    height: input.height,
    side: input.side,
  }
}

export const ViewForm = (_input: { form: Model; onInput: (dimensions: Model) => void }) => {
  return <>hex dimensions form</>
}
