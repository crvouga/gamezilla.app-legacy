import type { ClientCtx } from 'gamezilla-app/app/@/client'
import { Button, IconArrowLeftOnRect } from 'gamezilla-app/app/@/ui'

export const ViewBottomBarExitButton = (input: { onClick: () => void; ctx: ClientCtx }) => {
  return (
    <div className='flex w-full items-center gap-4 border-t  p-4'>
      <Button
        onClick={input.onClick}
        className='flex-1'
        text={input.ctx.t('app.exit')}
        renderIconStart={(iconInput) => <IconArrowLeftOnRect {...iconInput} />}
        variant='contained'
        color='default'
      />
    </div>
  )
}
