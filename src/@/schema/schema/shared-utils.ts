const toErrorMessage = (expected: string, actual: string, actualValue: string) => {
  return `Expected: ${expected}.\nActual Type: ${actual}.\nActual Value: ${actualValue}\n`
}

const safeJsonStringify = (_input: unknown): string => {
  return '[object]'
  // try {
  //   return JSON.stringify(input)
  // } catch (error) {
  //   return String(input)
  // }
}

const isIndexable = (input: unknown): input is Record<string, unknown> => {
  return typeof input === 'object' && input !== null
}

export { toErrorMessage, safeJsonStringify, isIndexable }
