import type { BaseClientCtx } from '~/app/@/client'
import { Chip } from '~/app/@/ui/chip'

export const ViewYouChip = (input: { ctx: BaseClientCtx }) => {
  return <Chip>{input.ctx.t('you')}</Chip>
}
