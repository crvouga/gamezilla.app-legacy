import { Result } from '~/@/result'

export type IContentModeration = {
  isBad: (text: string) => Promise<Result<string, boolean>>
}
