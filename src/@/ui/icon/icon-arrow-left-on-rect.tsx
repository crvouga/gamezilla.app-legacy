import type { IconInput } from '../icon-shared'
import { IconArrowRightOnRect } from './icon-arrow-right-on-rect'

export const IconArrowLeftOnRect = (input: IconInput) => {
  return <IconArrowRightOnRect style={{ transform: 'rotate(180deg)', transformOrigin: 'center' }} {...input} />
}
