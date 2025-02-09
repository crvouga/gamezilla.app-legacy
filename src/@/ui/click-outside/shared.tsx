import { PubSub } from '~/@/sub'

export type Props = {
  id: string
  onKeyDown?: (e: KeyboardEvent) => void
  onClickOutside?: () => void
}

export const propsSub = PubSub.create<Props>()
