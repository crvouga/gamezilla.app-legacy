export type SecretString = {
  dangerouslyReadValue: () => string
  toString: () => string
  toJSON: () => string
}

const init = (name: string, value: unknown): SecretString | null => {
  if (typeof value !== 'string') {
    return null
  }
  const message = `SecretString.of(${name})`
  const secretString: SecretString = {
    dangerouslyReadValue: () => value,
    toString: () => message,
    [Symbol.for('nodejs.util.inspect.custom')]: () => message,
    toJSON: () => message,
  }
  return secretString
}

export const SecretString = {
  init,
}
