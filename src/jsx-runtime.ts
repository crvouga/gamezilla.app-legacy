declare global {
  module JSX {
    //   @ts-ignore
    type IntrinsicElements = Record<
      keyof HTMLElementTagNameMap,
      Record<string, any>
    >
  }
}

export type Component = (props: Record<string, any>) => any

export const jsx = {
  component(
    component: string | Component,
    props: Record<string, any> | null,
    ...children: any[]
  ) {
    if (!props) props = {}
    props.children = children.flat(Infinity)

    if (typeof component === "function") return component(props)

    const element = document.createElement(component)
    for (const [key, value] of Object.entries(props)) {
      if (key === "children") {
        continue
      } else if (key === "className") {
        element.setAttribute("class", value)
      } else if (key === "style") {
        Object.assign(element.style, value)
      } else if (typeof value === "function" && key.startsWith("on")) {
        element.addEventListener(key.slice(2).toLowerCase(), value)
      } else if (value === true) {
        element.setAttribute(key, "")
      } else if (value === false) {
        continue
      } else if (typeof value === "function") {
        const result = value()
        element.append(result)
      } else {
        element.setAttribute(key, value)
      }
    }

    element.append(...props.children)

    return element
  },
  fragment(props: Record<string, any> | null, ...children: any[]) {
    if (!props) props = {}

    props.children = children.flat(Infinity)

    const fragment = document.createDocumentFragment()
    fragment.append(...props.children)

    return fragment
  },
}
