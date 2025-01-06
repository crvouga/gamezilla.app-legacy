import { render, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { VDom } from '../vdom'
import type { ITestRender, TestNode } from './interface'

export const TestRenderReact: ITestRender = (vdom: VDom): TestNode => {
  const rendered = render(vdom)

  const getAttributeDeep = (element: HTMLElement, attribute: string): string | null => {
    const attrValue = element.getAttribute(attribute)
    if (attrValue !== null) {
      return attrValue
    }
    for (const child of Array.from(element.children)) {
      const childAttrValue = getAttributeDeep(child as HTMLElement, attribute)
      if (childAttrValue !== null) {
        return childAttrValue
      }
    }
    return null
  }

  const createTestNode = (baseElement: HTMLElement): TestNode => {
    return {
      get disabled(): boolean {
        const ariaDisabled = baseElement.ariaDisabled
        const disabled = baseElement instanceof HTMLButtonElement && baseElement.disabled
        const disabledAttr = baseElement.getAttribute('disabled')
        const ariaDisabledAttr = baseElement.getAttribute('aria-disabled')
        return (
          disabled ||
          ariaDisabled === 'true' ||
          ariaDisabled === '' ||
          disabledAttr === 'true' ||
          disabledAttr === '' ||
          ariaDisabledAttr === 'true' ||
          ariaDisabledAttr === ''
        )
      },
      click(): void {
        userEvent.click(baseElement)
      },
      getByRole(role, name) {
        try {
          const element = within(baseElement).getByRole(role, {
            name,
          })
          if (!element) {
            return null
          }
          return createTestNode(element)
        } catch {
          return null
        }
      },
      getAttribute(attribute) {
        return getAttributeDeep(baseElement, attribute)
      },
      getByTestId(testId) {
        try {
          const element = within(baseElement).getByTestId(testId)
          if (!element) {
            return null
          }
          return createTestNode(element as HTMLElement)
        } catch {
          return null
        }
      },
    }
  }

  return createTestNode(rendered.container)
}
