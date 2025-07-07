import { s } from '~/@/schema'

const schema = s.obj({
  message: s.unknown,
})

export type DbErr = s.Infer<typeof schema>

const from = <T>(error: T): DbErr => {
  if (error instanceof Error) {
    return {
      ...error,
      message: error.message,
    }
  }

  if (typeof error === 'string') {
    return {
      message: error,
    }
  }

  return {
    ...error,
    message: 'Unknown error',
  }
}

export const DbErr = {
  schema,
  from,
}
