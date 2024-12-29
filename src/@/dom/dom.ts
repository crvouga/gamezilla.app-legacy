export function waitForElementById(htmlId: string | number, parentHtmlId?: string, maxWait = 5000) {
  const element = document.getElementById(String(htmlId))

  if (element) {
    // If the element is already available, resolve the promise immediately
    return Promise.resolve(element)
  }

  const parentElement = document.getElementById(String(parentHtmlId)) ?? document.body

  return new Promise<HTMLElement | null>((resolve) => {
    const timeout = setTimeout(() => {
      observer.disconnect()
      resolve(null)
    }, maxWait)
    const observer = new MutationObserver(() => {
      const targetElement = document.getElementById(String(htmlId))
      if (targetElement) {
        observer.disconnect()
        clearTimeout(timeout)
        resolve(targetElement)
      }
    })

    observer.observe(parentElement, {
      childList: true,
      subtree: true
    })
  })
}
