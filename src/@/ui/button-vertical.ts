import { h } from '~/@/vdom/h'
import type { VDom } from '~/@/vdom/vdom'
import { Button } from './button'
import { theme } from './theme/theme'

export const ButtonVertical = (props: { children: VDom[] }) => {
  return h(
    Button,
    {
      style: theme({ flexDirection: 'col', gap: 2 }),
      width: 'full',
    },
    props.children,
  )
}
