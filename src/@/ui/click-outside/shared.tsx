import { Sub } from '~/@/sub'

export type Props = {
  id: string
  onKeyDown?: (e: KeyboardEvent) => void
  onClickOutside?: () => void
}

export const propsSub = Sub.create<Props>()
