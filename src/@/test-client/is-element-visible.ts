export const isElementVisible = (node: Element) => {
  if (!node) return false

  const ariaHidden = node.getAttribute('aria-hidden')
  if (ariaHidden === 'true') return false

  const computedStyle = window.getComputedStyle(node)
  if (computedStyle.display === 'none') return false
  if (computedStyle.visibility === 'hidden') return false
  if (computedStyle.visibility === 'collapse') return false
  if (computedStyle.opacity === '0') return false

  let parent = node.parentElement
  while (parent) {
    const parentStyle = window.getComputedStyle(parent)
    if (parentStyle.display === 'none') return false
    if (parentStyle.visibility === 'hidden') return false
    if (parentStyle.visibility === 'collapse') return false
    if (parent.getAttribute('aria-hidden') === 'true') return false

    parent = parent.parentElement
  }
  return true
}
