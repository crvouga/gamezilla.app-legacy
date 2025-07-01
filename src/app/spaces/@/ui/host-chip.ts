import { Chip } from '~/@/ui/chip'
import { cn } from '~/@/ui/cn'
import { IconCrown } from '~/@/ui/icon'
import { v } from '~/@/vdom/v'
import { AppFrontendCtxBase } from '~/app/@/frontend/ctx'

export const ViewHostChip = (input: { ctx: AppFrontendCtxBase }) => {
  return v(Chip, {
    size: 'sm',
    renderStartIcon: (input) => v(IconCrown, { className: cn(input.className, 'text-yellow-300') }),
    label: input.ctx.t('host'),
  })
}
