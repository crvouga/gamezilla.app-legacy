import { BaseFrontendCtx } from '~/app/@/frontend/ctx'
import { cn, IconCrown } from '~/@/ui'
import { Chip } from '~/@/ui/chip'

export const ViewHostChip = (input: { ctx: BaseFrontendCtx }) => {
  return (
    <Chip
      size='sm'
      renderStartIcon={(input) => <IconCrown className={cn(input.className, 'text-yellow-300')} />}
      label={input.ctx.t('host')}
    />
  )
}
