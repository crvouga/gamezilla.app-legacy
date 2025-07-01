import { v } from '~/@/vdom/v'
import './click-outside-element'
import { Props, propsSub } from './shared'

export const ClickOutside = (
  props: Props & {
    className?: string
    children: React.ReactNode
  },
) => {
  propsSub.pub(props)
  return v(
    'click-outside',
    {
      id: props.id,
      className: props.className,
    },
    [props.children],
  )
}
