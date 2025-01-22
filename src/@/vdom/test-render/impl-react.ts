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
      query(cssSelector) {
        return Array.from(baseElement.querySelectorAll(cssSelector)).map((element) => {
          return createTestNode(element as HTMLElement)
        })
      },
      getByRole(role, name) {
        try {
          const elements = within(baseElement).getAllByRole(role, {
            name,
          })
          return elements.map((element) => {
            return createTestNode(element as HTMLElement)
          })
        } catch {
          return []
        }
      },
      getAttribute(attribute) {
        return getAttributeDeep(baseElement, attribute)
      },
      getByTestId(testId) {
        try {
          const element = within(baseElement).getAllByTestId(testId)
          return element.map((element) => {
            return createTestNode(element as HTMLElement)
          })
        } catch {
          return []
        }
      },
    }
  }

  return createTestNode(rendered.container)
}
