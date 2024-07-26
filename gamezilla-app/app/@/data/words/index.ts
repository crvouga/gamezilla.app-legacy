export const getAdjectives = async () => {
  const { adjectives } = await import('./adjective')
  return adjectives
}

export const getNouns = async () => {
  const { nouns } = await import('./noun')
  return nouns
}

export const getWords = async () => {
  const adjectives = await getAdjectives()
  const nouns = await getNouns()
  return { adjectives, nouns }
}
