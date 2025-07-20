import { h } from '~/@/vdom/h'
import { IconSpinner } from './icon'

export const Spinner = (props: { class?: string }) => {
  return h(IconSpinner, {
    class: `animate-spin ${props.class ?? 'size-20'}`,
  })
}
