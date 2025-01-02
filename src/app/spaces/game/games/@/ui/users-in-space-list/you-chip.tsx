import { BaseClientCtx } from '~/app/@/client/ctx'
import { Chip } from '~/app/@/ui/chip'

export const ViewYouChip = (input: { ctx: BaseClientCtx }) => {
  return <Chip>{input.ctx.t('you')}</Chip>
}
