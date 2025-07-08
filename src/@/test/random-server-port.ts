const seen = new Set<number>()
export const randomServerPort = (): number => {
  const port = randomIntegerBetween(3000, 9000)
  if (seen.has(port)) return randomServerPort()
  seen.add(port)
  return port
}

const randomIntegerBetween = (min: number, max: number): number => {
  return min + Math.floor(Math.random() * (max - min + 1))
}
