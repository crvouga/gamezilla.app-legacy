import { Result } from '~/@/result'
import { p } from '~/@/parser'

const parser = p.brand(p.str, 'ClientId')

export type ClientId = p.Infer<typeof parser>

const is = (id: unknown): id is ClientId => {
  return typeof id === 'string'
}

type Problem = 'invalid_frontend_id'

const decode = (id: string): Result<Problem, ClientId> => {
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

const namespace = 'client'
const separator = ':'

const generate = (): ClientId => {
  const id = `${generateId(5)}`

  const clientId = `${namespace}${separator}${id}`

  if (is(clientId)) {
    return clientId
  }

  throw new Error('generated invalid client id')
}

export const ClientId = {
  ...parser,
  is,
  decode,
  generate,
}
