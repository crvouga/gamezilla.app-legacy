import { Err, isErr, Ok, Result } from '../result'

export type IUnitOfWork = {
  start: () => Promise<Result<string, null>>
  commit: () => Promise<Result<string, null>>
  rollback: () => Promise<Result<string, null>>
}

const implementations = new Set<IUnitOfWork>()

const register = (implementation: IUnitOfWork) => {
  implementations.add(implementation)
}

export const UnitOfWork = (): IUnitOfWork => {
  return {
    start: async () => {
      for (const implementation of implementations) {
        const result = await implementation.start()
        if (isErr(result)) {
          return Err(result.error)
        }
      }
      return Ok(null)
    },
    commit: async () => {
      for (const implementation of implementations) {
        const result = await implementation.commit()
        if (isErr(result)) {
          return Err(result.error)
        }
      }
      return Ok(null)
    },
    rollback: async () => {
      for (const implementation of implementations) {
        const result = await implementation.rollback()
        if (isErr(result)) {
          return Err(result.error)
        }
      }
      return Ok(null)
    },
  }
}

UnitOfWork.register = register
