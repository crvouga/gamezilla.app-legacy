import type { VDom } from '~/@/vdom'

type Truthy<T> = T extends null | undefined | false | '' | 0 ? never : T

const isTruthy = <T,>(value: T): value is Truthy<T> => {
  return Boolean(value)
}

export const Show = <T,>({ when, render }: { when: () => T; render: (value: Truthy<T>) => VDom }): VDom => {
  const value = when()
  if (isTruthy(value)) {
    return render(value)
  }
  return null
}
