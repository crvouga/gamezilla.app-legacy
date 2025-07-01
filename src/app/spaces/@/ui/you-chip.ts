import { AppFrontendCtxBase } from '~/app/@/frontend/ctx'
import { Chip } from '~/@/ui/chip'
import { v } from '~/@/vdom/v'

export const ViewYouChip = (input: { ctx: AppFrontendCtxBase }) => {
  return v(Chip, { size: 'sm', label: input.ctx.t('you') })
}
