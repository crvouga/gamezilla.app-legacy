const seen = new Set<number>()
export const randomServerPort = (): number => {
  const port = 1000 + Math.floor(Math.random() * 9000)
  if (seen.has(port)) return randomServerPort()
  seen.add(port)
  return port
}
