import { Result } from '~/@/result'
import { p } from '~/@/parser'

const parser = p.brand(p.str, 'FrontendId')

export type FrontendId = p.Infer<typeof parser>

const is = (id: unknown): id is FrontendId => {
  return typeof id === 'string'
}

type Problem = 'invalid_frontend_id'

const decode = (id: string): Result<Problem, FrontendId> => {
  if (is(id)) {
    return Result.Ok(id)
  }

  return Result.Err('invalid_frontend_id')
}

const characters = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890'

const randomCharacter = (word: string): string => {
  return word[Math.floor(Math.random() * word.length)] ?? 'a'
}

const generateId = (length: number): string => {
  let runningId = ''

  for (let i = 0; i < length; i++) {
    runningId = `${runningId}${randomCharacter(characters)}`
  }

  return runningId
}

const namespace = 'frontend'
const separator = ':'

const generate = (): FrontendId => {
  const id = `${generateId(5)}`

  const frontendId = `${namespace}${separator}${id}`

  if (is(frontendId)) {
    return frontendId
  }

  throw new Error('generated invalid frontend id')
}

export const FrontendId = {
  ...parser,
  is,
  decode,
  generate,
}
