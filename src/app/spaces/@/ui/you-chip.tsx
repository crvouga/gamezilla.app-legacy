import { AppFrontendCtxBase } from '~/app/@/frontend/ctx'
import { Chip } from '~/@/ui/chip'

export const ViewYouChip = (input: { ctx: AppFrontendCtxBase }) => {
  return <Chip size='sm' label={input.ctx.t('you')} />
}
