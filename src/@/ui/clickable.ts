import { AriaRole } from '../vdom/aria-role'
import { VDom } from '../vdom/vdom'
import { h } from '~/@/vdom/h'
import { cn } from './cn'
import { PAPER_CLASS_NAME } from './paper'

export type ClickableEvent = {
  stopPropagation: () => void
  currentTarget: EventTarget | null
}

export type ClickableProps = {
  class?: string
  children?: VDom[]
  onClick?: (event: ClickableEvent) => void
  role?: AriaRole
  name?: string
  title?: string
  type?: 'button' | 'submit' | 'reset'
  tabIndex?: number
  disabled?: boolean
  dataTestId?: string
  'aria-label'?: string
  'aria-hidden'?: boolean
  'aria-disabled'?: boolean
  key?: string
  [key: string]: unknown
}

export const Clickable = ({ dataTestId, ...input }: ClickableProps) => {
  return h(
    'button',
    {
      ...input,
      'aria-hidden': input['aria-hidden'] ? 'true' : 'false',
      'aria-disabled': input['aria-disabled'] ? 'true' : 'false',
      'data-testid': dataTestId,
      type: input.type ?? 'button',
      onClick: input.onClick,
      disabled: input.disabled,
      role: input.role,
      name: input.name,
      tabIndex: input.tabIndex,
      title: input.title,
      class: cn(
        'touch-manipulation enabled:cursor-pointer enabled:active:opacity-75 disabled:cursor-not-allowed disabled:opacity-50',
        input.class,
      ),
    },
    [input.children],
  )
}

export const ClickableTransparent = (input: ClickableProps) => {
  return h(
    Clickable,
    {
      ...input,
      class: cn('[@media(hover:hover)]:enabled:hover:bg-neutral-700/50', input.class),
    },
    input.children,
  )
}

export const ClickablePaper = (input: ClickableProps) => {
  return h(
    Clickable,
    {
      ...input,
      class: cn(PAPER_CLASS_NAME, '[@media(hover:hover)]:enabled:hover:bg-neutral-800', input.class),
    },
    [input.children],
  )
}
