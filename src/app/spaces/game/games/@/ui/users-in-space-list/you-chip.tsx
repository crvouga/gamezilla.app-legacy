import { BaseFrontendCtx } from '~/app/@/frontend/ctx'
import { Chip } from '~/app/@/ui/chip'

export const ViewYouChip = (input: { ctx: BaseFrontendCtx }) => {
  return <Chip size='sm' label={input.ctx.t('you')} />
}
