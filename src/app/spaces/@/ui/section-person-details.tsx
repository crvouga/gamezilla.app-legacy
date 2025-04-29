import { Avatar, Button, Typography } from '~/@/ui'
import { UserProfile } from '~/app/@/data/user-profile'
import { SpaceFrontendCtx } from '~/app/spaces/@/frontend/ctx'
import { ViewHostChip } from '~/app/spaces/@/ui/host-chip'
import { ViewYouChip } from '~/app/spaces/@/ui/you-chip'

export const SectionPersonDetails = (input: {
  ctx: SpaceFrontendCtx
  profile: UserProfile | null
  onOpenDetails: () => void
}) => {
  return (
    <div>
      <button
        type='button'
        className='flex w-full flex-col items-center justify-center gap-2 p-4'
        onClick={input.onOpenDetails}
      >
        <Avatar src={input.profile ? UserProfile.toAvatarUrl(input.profile) : ''} className='size-24' />
        {input.profile && <Typography variant='title' text={input.ctx.t('username', input.profile?.username)} />}
        <div className='flex items-center gap-2'>
          {input.ctx.space.hostId === input.profile?.id && <ViewHostChip ctx={input.ctx} />}
          {input.ctx.currentUser.userId === input.profile?.id && <ViewYouChip ctx={input.ctx} />}
        </div>
      </button>

      <div className='w-full px-4 pb-8'>
        <Button onClick={input.onOpenDetails} className='w-full' text={input.ctx.t('spaces.see-profile')} />
      </div>
    </div>
  )
}
