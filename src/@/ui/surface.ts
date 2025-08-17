import { h } from '~/@/vdom/h'
import { Box } from '~/@/vdom/primitives/box'
import { VDom } from '~/@/vdom/vdom'
import { AriaRole } from '../html/aria-role'
import { sx } from '../vdom/style/sx'

export const SURFACE_STYLE = sx({
  backgroundColor: 'black',
  borderWidth: 2,
  borderColor: 'neutral-700',
})

export const Surface = (input: {
  children?: VDom[]
  style?: Record<string, unknown>
  role?: AriaRole
  'aria-hidden'?: boolean
  'aria-label'?: string
}) => {
  return h(
    Box,
    {
      style: {
        ...SURFACE_STYLE,
        ...input.style,
      },
      role: input.role,
      'aria-hidden': input['aria-hidden'],
      'aria-label': input['aria-label'],
    },
    input.children,
  )
}
