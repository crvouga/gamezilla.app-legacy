import { Err, Ok, Result } from '../result'

export type SecretString = {
  dangerouslyReadValue: () => string
  toString: () => string
  toJSON: () => string
}

const init = (name: string, value: unknown): Result<string, SecretString> => {
  if (typeof value !== 'string') {
    return Err(`SecretString named ${name} must be a string. This is used to prevent accidental logging of secrets.`)
  }
  const message = `SecretString.of(${name})`
  const secretString: SecretString = {
    dangerouslyReadValue: () => value,
    toString: () => message,
    [Symbol.for('nodejs.util.inspect.custom')]: () => message,
    toJSON: () => message,
  }
  return Ok(secretString)
}

export const SecretString = {
  init,
}
