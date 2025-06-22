import { Err, isOk, Result } from '../result'

/**
 * @description
 * This function is used to parse data from unknown.
 * It will try to parse the data with all the registered functions.
 * If no function can parse the data, it will return an error.
 *
 */
export const FromUnknown = <T>() => {
  const fromUnknownRegistry: ((data: unknown) => Result<string, T>)[] = []
  const fromUnknownPartialRegistry: ((data: unknown) => Result<string, Partial<T>>)[] = []

  /**
   * @description
   * This function is used to register a function that will be used to parse data from unknown.
   *
   * @param fn - The function to register.
   * @returns {void}
   */
  const fromUnknownRegister = (fn: (data: unknown) => Result<string, T>) => {
    fromUnknownRegistry.push(fn)
  }

  /**
   * @description
   * This function is used to register a function that will be used to parse data from unknown.
   *
   * @param fn - The function to register.
   * @returns {void}
   */
  const fromUnknownPartialRegister = (fn: (data: unknown) => Result<string, Partial<T>>) => {
    fromUnknownPartialRegistry.push(fn)
  }

  /**
   * @description
   * This function is used to parse data from unknown.
   * It will try to parse the data with all the registered functions.
   * If no function can parse the data, it will return an error.
   *
   * @param data - The data to parse.
   * @returns {Result<string, T>} - The result of the parsing.
   */
  const fromUnknown = (data: unknown): Result<string, T> => {
    for (const fn of fromUnknownRegistry) {
      const result = fn(data)
      if (isOk(result)) {
        return result
      }
    }
    return Err('Failed to parse from unknown. No matching function found.')
  }

  const fromUnknownPartial = (data: unknown): Result<string, Partial<T>> => {
    return fromUnknown(data)
  }

  return {
    fromUnknownRegister,
    fromUnknown,
    fromUnknownPartialRegister,
    fromUnknownPartial,
  }
}
