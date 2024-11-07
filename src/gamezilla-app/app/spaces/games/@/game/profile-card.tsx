import { TranslatedText } from '@/l18n'
import { Translator } from '@/l18n/generated'
import type { Profile } from 'gamezilla-app/app/@/data'
import { Avatar, Typography } from 'gamezilla-app/app/@/ui'

export const ProfileCard = ({
  profile,
  subtitle,
  ctx
}: {
  ctx: {
    t: Translator
  }
  profile?: Profile | null
  subtitle?: TranslatedText
}) => {
  return (
    <div className='flex w-full items-center gap-2 p-2'>
      <Avatar className='size-10' src={profile?.avatarUrl} />
      <div className='flex flex-1 flex-col gap-0.5'>
        {profile && <Typography variant='body' text={ctx.t('username', profile.username)} />}

        {subtitle && <Typography className='text-secondary' variant='caption' text={subtitle} />}
      </div>
    </div>
  )
}
