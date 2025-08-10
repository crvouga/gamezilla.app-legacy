import { h } from '~/@/vdom/h'
import type { VDom } from '~/@/vdom/vdom'
import { Button } from './button'
import { sx } from './theme/theme'

export const ButtonVertical = (props: { children: VDom[] }) => {
  return h(
    Button,
    {
      style: sx({ flexDirection: 'col', gap: 2 }),
      width: 'full',
    },
    props.children,
  )
}
