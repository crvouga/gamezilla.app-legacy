import { v } from '~/@/vdom/v'

export const Skeleton = (props: { className?: string }) => {
  return v('div', { className: `animate-pulse bg-neutral-800 rounded ${props.className ?? ''}` })
}
