import { Chip } from '~/@/ui/chip'
import { cn } from '~/@/ui/cn'
import { IconCrown } from '~/@/ui/icon'
import { h } from '~/@/vdom/h'
import { AppFrontendCtxBase } from '~/app/@/frontend/ctx'

export const ViewHostChip = (input: { ctx: AppFrontendCtxBase }) => {
  return h(Chip, {
    size: 'sm',
    renderStartIcon: (input) => h(IconCrown, { className: cn(input.className, 'text-yellow-300') }),
    label: input.ctx.t('host'),
  })
}
