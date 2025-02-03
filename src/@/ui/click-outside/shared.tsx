import { PubSub } from '~/@/sub'

export type Props = {
  id: string
  onClickOutside?: () => void
}

export const propsSub = PubSub.create<Props>()
