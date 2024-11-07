import { Result } from '@/core'

export type IContentModeration = {
  isBad: (text: string) => Promise<Result<string, boolean>>
}
