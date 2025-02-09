import { propsSub, Props } from './shared'
import './click-outside-element'

export const ClickOutside = (
  props: Props & {
    className?: string
    children: React.ReactNode
  },
) => {
  propsSub.pub(props)
  return (
    // @ts-expect-error unable to type custom elements
    <click-outside id={props.id} className={props.className}>
      {props.children}
      {/* @ts-expect-error unable to type custom elements */}
    </click-outside>
  )
}
