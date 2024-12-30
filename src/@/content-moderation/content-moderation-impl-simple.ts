import { Result } from '~/@/result'

export type ContentModeration = {
  isBad: (text: string) => Promise<Result<string, boolean>>
}
