import { s } from '~/@/schema'
import { Box } from '~/@/vdom/primitives/box'
import { h } from '~/@/vdom/h'
import { Text } from '~/@/vdom/primitives/text'

export const Model = s.obj({
  t: s.l('tri'),
  side: s.num(),
})

export type Model = s.Infer<typeof Model>

export const init = (input: { side: number }): Model => {
  return {
    t: 'tri',
    side: input.side,
  }
}

export const ViewForm = (_input: { form: Model; onInput: (dimensions: Model) => void }) => {
  return h(Box, {}, [h(Text, { text: 'tri dimensions form' })])
}
