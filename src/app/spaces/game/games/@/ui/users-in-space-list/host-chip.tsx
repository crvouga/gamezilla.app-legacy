import { BaseFrontendCtx } from '~/app/@/frontend/ctx'
import { IconCrown } from '~/app/@/ui'
import { Chip } from '~/app/@/ui/chip'

export const ViewHostChip = (input: { ctx: BaseFrontendCtx }) => {
  return (
    <Chip>
      <IconCrown className='h-4 w-4 text-yellow-300' />
      {input.ctx.t('host')}
    </Chip>
  )
}
