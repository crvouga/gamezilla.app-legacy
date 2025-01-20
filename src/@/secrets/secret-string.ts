export type SecretString = {
  dangerouslyReadValue: () => string
  toString: () => string
  toJSON: () => string
}

const of = (name: string, value: unknown): SecretString => {
  if (typeof value !== 'string') {
    throw new Error('SecretString must be a string. This is used to prevent accidental logging of secrets.')
  }
  const message = `SecretString.of(${name})`
  return {
    dangerouslyReadValue: () => value,
    toString: () => message,
    [Symbol.for('nodejs.util.inspect.custom')]: () => message,
    toJSON: () => message,
  }
}

export const SecretString = {
  of,
}
