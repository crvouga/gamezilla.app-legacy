import { BaseFrontendCtx } from '~/app/@/frontend/ctx'
import { cn, IconCrown } from '~/app/@/ui'
import { Chip } from '~/app/@/ui/chip'

export const ViewHostChip = (input: { ctx: BaseFrontendCtx }) => {
  return (
    <Chip
      size='sm'
      renderStartIcon={(input) => <IconCrown className={cn(input.className, 'text-yellow-300')} />}
      label={input.ctx.t('host')}
    />
  )
}
