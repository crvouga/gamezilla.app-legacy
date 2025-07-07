import { Result } from '../result'
import { Sub } from '../sub'

export type INavigation = {
  push: (name: string, value: string) => Promise<Result<string, null>>
  replace: (name: string, value: string) => Promise<Result<string, null>>
  back: () => Promise<Result<string, null>>
  clear: () => Promise<Result<string, null>>
  get: (name: string) => string | null
  sub: (name: string) => Sub<string | null>
}
