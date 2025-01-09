export const env: Record<string, string | undefined> = {
  ...(typeof process.env === 'undefined' ? {} : process.env),
  ...(typeof import.meta.env === 'undefined' ? {} : import.meta.env),
}
