import type { BaseClientCtx } from '~/app/@/client'
import { IconCrown } from '~/app/@/ui'
import { Chip } from '~/app/@/ui/chip'

export const ViewHostChip = (input: { ctx: BaseClientCtx }) => {
  return (
    <Chip>
      <IconCrown className='h-4 w-4 text-yellow-300' />
      {input.ctx.t('host')}
    </Chip>
  )
}
