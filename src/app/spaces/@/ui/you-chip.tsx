import { BaseFrontendCtx } from '~/app/@/frontend/ctx'
import { Chip } from '~/@/ui/chip'

export const ViewYouChip = (input: { ctx: BaseFrontendCtx }) => {
  return <Chip size='sm' label={input.ctx.t('you')} />
}
