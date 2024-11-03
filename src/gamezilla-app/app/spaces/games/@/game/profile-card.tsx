import { TranslatedText } from 'gamezilla-app/@/l18n'
import { Translator } from 'gamezilla-app/@/l18n/generated'
import type { Profile } from 'gamezilla-app/app/@/data'
import { Avatar, Typography } from 'gamezilla-app/app/@/ui'

export const ViewProfileCard = ({
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
      <Avatar className='h-12 w-12' src={profile?.avatarUrl} />
      <div className='flex flex-1 flex-col'>
        {profile && <Typography variant='body' text={ctx.t('username', profile.username)} />}

        {subtitle && <Typography variant='caption' text={subtitle} />}
      </div>
    </div>
  )
}
