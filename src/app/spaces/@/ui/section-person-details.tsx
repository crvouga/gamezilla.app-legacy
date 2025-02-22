import { Avatar, Button, Typography } from '~/@/ui'
import type { Profile } from '~/app/@/data/profile'
import { SpaceFrontendCtx } from '~/app/spaces/@/frontend/ctx'
import { ViewHostChip } from '~/app/spaces/@/ui/host-chip'
import { ViewYouChip } from '~/app/spaces/@/ui/you-chip'

export const SectionPersonDetails = (input: {
  ctx: SpaceFrontendCtx
  profile: Profile | null
  onOpenDetails: () => void
}) => {
  return (
    <div>
      <button
        type='button'
        className='flex w-full flex-col items-center justify-center gap-2 p-4'
        onClick={input.onOpenDetails}
      >
        <Avatar src={input.profile?.avatarUrl} className='size-24' />
        {input.profile && <Typography variant='title' text={input.ctx.t('username', input.profile?.username)} />}
        <div className='flex items-center gap-2'>
          {input.ctx.space.hostId === input.profile?.userId && <ViewHostChip ctx={input.ctx} />}
          {input.ctx.currentUser.userId === input.profile?.userId && <ViewYouChip ctx={input.ctx} />}
        </div>
      </button>

      <div className='w-full px-4 pb-8'>
        <Button onClick={input.onOpenDetails} className='w-full' text={input.ctx.t('spaces.see-profile')} />
      </div>
    </div>
  )
}
