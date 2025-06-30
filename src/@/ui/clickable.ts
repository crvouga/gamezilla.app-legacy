import { AriaRole } from '../vdom/aria-role'
import { VDom } from '../vdom/vdom'
import { h } from '~/@/vdom/h'
import { cn } from './cn'
import { PAPER_CLASS_NAME } from './paper'

export type ClickableEvent = {
  stopPropagation: () => void
  currentTarget: HTMLButtonElement
}

export type ClickableProps = {
  className?: string
  children?: VDom
  onClick?: (event: ClickableEvent) => void
  role?: AriaRole
  name?: string
  title?: string
  type?: 'button' | 'submit' | 'reset'
  tabIndex?: number
  disabled?: boolean
  dataTestId?: string
  'data-fab'?: boolean
  'aria-label'?: string
}

export const Clickable = ({ dataTestId, ...input }: ClickableProps) => {
  return h(
    'button',
    {
      ...input,
      'data-testid': dataTestId,
      type: input.type ?? 'button',
      onClick: input.onClick,
      disabled: input.disabled,
      role: input.role,
      name: input.name,
      tabIndex: input.tabIndex,
      title: input.title,
      className: cn(
        'touch-manipulation enabled:cursor-pointer enabled:active:opacity-75 disabled:cursor-not-allowed disabled:opacity-50',
        input.className,
      ),
    },
    ...(Array.isArray(input.children) ? input.children : [input.children]),
  )
}

export const ClickableTransparent = (input: ClickableProps) => {
  return h(
    Clickable,
    { ...input, className: cn('[@media(hover:hover)]:enabled:hover:bg-neutral-700/50', input.className) },
    ...(Array.isArray(input.children) ? input.children : [input.children]),
  )
}

export const ClickablePaper = (input: ClickableProps) => {
  return h(
    Clickable,
    {
      ...input,
      className: cn(PAPER_CLASS_NAME, '[@media(hover:hover)]:enabled:hover:bg-neutral-800', input.className),
    },
    ...(Array.isArray(input.children) ? input.children : [input.children]),
  )
}
