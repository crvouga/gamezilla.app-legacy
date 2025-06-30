import { AppFrontendCtxBase } from '~/app/@/frontend/ctx'
import { cn } from '~/@/ui/cn'
import { IconCrown } from '~/@/ui/icon'
import { Chip } from '~/@/ui/chip'

export const ViewHostChip = (input: { ctx: AppFrontendCtxBase }) => {
  return (
    <Chip
      size='sm'
      renderStartIcon={(input) => <IconCrown className={cn(input.className, 'text-yellow-300')} />}
      label={input.ctx.t('host')}
    />
  )
}
