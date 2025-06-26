export const reactComponentTreeToString = (element: any, depth = 0): string => {
  if (!element) return 'null'
  if (typeof element === 'string') return 'Text'
  if (Array.isArray(element)) {
    return `[${element.map((e) => reactComponentTreeToString(e, depth + 1)).join(', ')}]`
  }

  const name = getComponentName(element)
  const children = element.props?.children

  if (!children) return name

  const childrenStr = reactComponentTreeToString(children, depth + 1)
  return `${name}(${childrenStr})`
}

const getComponentName = (element: unknown): string => {
  if (!element) return 'undefined'
  if (typeof element === 'string') return 'string'
  if (Array.isArray(element)) return 'Array'
  if (typeof element === 'object' && 'type' in element) {
    if (typeof element.type === 'function') {
      return element.type.name || 'Anonymous'
    }
    return String(element.type)
  }
  return Object.prototype.toString.call(element).slice(8, -1)
}
