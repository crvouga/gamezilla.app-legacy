import { TranslatedText } from '~/@/l18n'
import { Translator } from '~/@/l18n/generated'
import { UserProfile } from '~/app/@/data/user-profile'
import { Avatar } from '~/@/ui/avatar'
import { Typography } from '~/@/ui/typography'

export const ProfileListItem = ({
  profile,
  subtitle,
  ctx,
}: {
  ctx: {
    t: Translator
  }
  profile?: UserProfile | null
  subtitle?: TranslatedText
}) => {
  return (
    <div className='flex w-full items-center gap-2 p-2'>
      <Avatar className='size-12' src={profile ? UserProfile.toAvatarUrl(profile) : ''} />
      <div className='flex flex-1 flex-col gap-0.5'>
        {profile && <Typography variant='body' text={ctx.t('username', profile.username)} />}

        {subtitle && <Typography color='text-secondary' variant='caption' text={subtitle} />}
      </div>
    </div>
  )
}
