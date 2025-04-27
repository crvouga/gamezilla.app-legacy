import type { Brand } from '~/@/brand/brand'
import { Result } from '~/@/result'
import { p } from '~/@/parser'

export type ClientSessionId = Brand<string, 'ClientSessionId'>

const namespace = 'client-session'
const separator = ':'

const is = (id: unknown): id is ClientSessionId => {
  return typeof id === 'string'
}

const parser = p.custom(is, 'Invalid client session id')

type Problem = 'invalid-client-session-id'

export const decode = (id: string): Result<Problem, ClientSessionId> => {
  if (is(id)) {
    return Result.Ok(id)
  }

  return Result.Err('invalid-client-session-id')
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

export const generate = (): ClientSessionId => {
  const id = generateId(8)
  const clientSessionId = `${namespace}${separator}${id}`

  if (is(clientSessionId)) {
    return clientSessionId
  }

  throw new Error('generated invalid session id')
}

export const ClientSessionId = {
  ...parser,
  generate,
  decode,
  is,
}
