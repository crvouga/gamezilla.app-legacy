import { AriaRole } from '../vdom/aria-role'
import { VDom } from '../vdom/vdom'
import { cn } from './cn'

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
}

export const Clickable = (input: ClickableProps) => {
  return (
    <button
      type={input.type ?? 'button'}
      onClick={input.onClick}
      disabled={input.disabled}
      role={input.role}
      name={input.name}
      tabIndex={input.tabIndex}
      title={input.title}
      className={cn(
        'enabled:cursor-pointer enabled:active:opacity-75 disabled:cursor-not-allowed disabled:opacity-50',
        input.className,
      )}
    >
      {input.children}
    </button>
  )
}

export const ClickableTransparent = (input: ClickableProps) => {
  return (
    <Clickable {...input} className={cn('[@media(hover:hover)]:enabled:hover:bg-neutral-700/50', input.className)}>
      {input.children}
    </Clickable>
  )
}

export const ClickablePaper = (input: ClickableProps) => {
  return (
    <Clickable
      {...input}
      className={cn('bg-paper [@media(hover:hover)]:enabled:hover:bg-neutral-800', input.className)}
    >
      {input.children}
    </Clickable>
  )
}
