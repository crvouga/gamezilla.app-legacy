import { AriaRole } from '../vdom/aria-role'
import { VDom } from '../vdom/vdom'
import { h } from '~/@/vdom/h'

type OnClickEvent = {
  currentTarget?: HTMLFormElement | HTMLDivElement | HTMLButtonElement | null
}

type OnSubmitEvent = {
  preventDefault: () => void
}

export type OnKeyDownEvent = {
  key: string
  preventDefault: () => void
}

type DynamicElementProps = {
  element: 'form' | 'button' | 'div'
  onClick?: (e: OnClickEvent) => void
  onSubmit?: (e: OnSubmitEvent) => void
  onKeyDown?: (e: OnKeyDownEvent) => void
  type?: 'button' | 'submit' | 'reset'
  children?: VDom
  role?: AriaRole
  name?: string
  className?: string
  tabIndex?: number
  disabled?: boolean
  dataTestId?: string
  'aria-checked'?: boolean
}

export const DynamicElement = (input: DynamicElementProps) => {
  const { element, children, dataTestId, ...props } = input

  switch (element) {
    case 'form': {
      return h('form', { ...props, 'data-testid': dataTestId }, children)
    }
    case 'button': {
      return h('button', { ...props, 'data-testid': dataTestId }, children)
    }
    default: {
      return h('div', { ...props, 'data-testid': dataTestId }, children)
    }
  }
}
