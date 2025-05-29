export type WireFunction =
  | {
      t: 'connection-error'
      error: string
    }
  | {
      t: 'unknown'
      error: string
    }

const toString = (error: WireFunction): string => {
  switch (error.t) {
    case 'connection-error':
      return error.error
    case 'unknown':
      return error.error
  }
}

export const WireFunction = {
  toString,
}
