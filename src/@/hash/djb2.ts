export const djb2Hash = (str: string): number => {
  let hash = 5381
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = (hash << 5) + hash + char /* hash * 33 + c */
  }
  return hash
}
