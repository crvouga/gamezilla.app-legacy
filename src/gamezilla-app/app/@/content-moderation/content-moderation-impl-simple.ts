import { Result } from '@/core'

export type ContentModeration = {
  isBad: (text: string) => Promise<Result<string, boolean>>
}
