import { AriaRole } from '../vdom/aria-role'
import { VDom } from '../vdom/vdom'

type OnClickEvent = {
  currentTarget?: HTMLFormElement | HTMLDivElement | HTMLButtonElement | null
}

type OnSubmitEvent = {
  preventDefault: () => void
}

type OnKeyDownEvent = {
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
}

export const DynamicElement = (input: DynamicElementProps) => {
  const { element, children, dataTestId, ...props } = input

  switch (element) {
    case 'form': {
      return (
        <form data-testid={dataTestId} {...props}>
          {children}
        </form>
      )
    }
    case 'button': {
      return (
        <button data-testid={dataTestId} {...props}>
          {children}
        </button>
      )
    }
    default: {
      return (
        <div data-testid={dataTestId} {...props}>
          {children}
        </div>
      )
    }
  }
}
