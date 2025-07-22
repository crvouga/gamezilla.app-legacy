import { h } from '~/@/vdom/h'
import { Box } from '~/@/vdom/primitives/box'
import { Text } from '~/@/vdom/primitives/text'

export const CoverArt = () => {
  return h(Box, {}, [Text({ text: 'hello' })])
}
