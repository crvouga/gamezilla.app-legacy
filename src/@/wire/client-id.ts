import { Result } from '~/@/result'
import { s } from '~/@/schema'

const schema = s.brand(s.str(), 'ClientId')

export type ClientId = s.Infer<typeof schema>

const is = (id: unknown): id is ClientId => {
  return typeof id === 'string'
}

type Problem = 'invalid-client-id'

const decode = (id: string): Result<Problem, ClientId> => {
  if (is(id)) {
    return Result.Ok(id)
  }

  return Result.Err('invalid-client-id')
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
  ...schema,
  is,
  decode,
  generate,
}
