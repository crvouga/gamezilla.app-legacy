import { AppFrontendCtxBase } from '~/app/@/frontend/ctx'
import { Chip } from '~/@/ui/chip'
import { h } from '~/@/vdom/h'

export const ViewYouChip = (input: { ctx: AppFrontendCtxBase }) => {
  return h(Chip, { size: 'sm', label: input.ctx.t('you') })
}
