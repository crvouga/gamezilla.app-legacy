export type ShortId = string

const characters = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890'

const randomCharacter = (word: string): string => {
  return word[Math.floor(Math.random() * word.length)] ?? 'a'
}

const generate = (length: number): string => {
  let runningId = ''

  for (let i = 0; i < length; i++) {
    runningId = `${runningId}${randomCharacter(characters)}`
  }

  return runningId
}

export const ShortId = {
  generate,
}
