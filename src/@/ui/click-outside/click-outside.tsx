import { propsSub } from './shared'
import './click-outside-element'

export const ClickOutside = (props: {
  className?: string
  children: React.ReactNode
  id: string
  onClickOutside?: () => void
}) => {
  propsSub.pub(props)
  return (
    // @ts-expect-error unable to type custom elements
    <click-outside id={props.id} className={props.className}>
      {props.children}
      {/* @ts-expect-error unable to type custom elements */}
    </click-outside>
  )
}
