import { h } from '~/@/vdom/h'
import { Box } from '~/@/vdom/primitives/box'
import { Text } from '~/@/vdom/primitives/text'

export const ListLayout = () => {
  return h(Box, {}, [Text({ text: 'ListLayout' })])
}
