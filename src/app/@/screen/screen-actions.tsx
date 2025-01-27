import { TranslatedText } from '~/@/l18n'
import type { Translator } from '~/@/l18n/generated'
import type { VDom } from '~/@/vdom/vdom'
import { Drawer, IconEllipsisVertical, ListItemButton, Spinner, Typography, cn } from '~/@/ui'

export type ScreenAction = {
  label: TranslatedText
  disabled?: boolean
  icon: (input: { className: string }) => VDom
  classNames?: {
    button?: string
    label?: string
  }
  onClick: () => void
  loading?: boolean
  color?: 'danger' | 'success' | 'inherit' | 'selected'
  hidden?: boolean
}

type Ctx = {
  t: Translator
}

const DEFAULT_LIMIT = 4

const View = (input: {
  id: string
  ctx: Ctx
  buttons: (ScreenAction | null)[]
  open: boolean
  onToggle: () => void
  limit?: number
}) => {
  const cleanedButtons = input.buttons.filter((button) => button !== null)
  const firstButtons = cleanedButtons.slice(0, input.limit ?? DEFAULT_LIMIT)
  const lastButtons = cleanedButtons.slice(input.limit ?? DEFAULT_LIMIT)
  return (
    <div className='flex h-16 w-full shrink-0 items-center' role='toolbar'>
      {firstButtons.map((button) => (
        <ScreenActionButton {...button} key={button.label} />
      ))}

      {lastButtons.length > 0 && (
        <>
          <ScreenActionButton
            icon={(input) => <IconEllipsisVertical {...input} />}
            label={input.ctx.t('app.more')}
            onClick={input.onToggle}
          />
          <Drawer
            ctx={input.ctx}
            id={input.id}
            ariaLabel={input.ctx.t('app.more')}
            onClose={input.onToggle}
            open={input.open}
            position='bottom'
          >
            {lastButtons.map((button) =>
              button.hidden ? null : (
                <ListItemButton
                  key={button.label}
                  icon={button.icon}
                  label={button.label}
                  onClick={button.onClick}
                  color={button.color}
                />
              ),
            )}
          </Drawer>
        </>
      )}
    </div>
  )
}

const ScreenActionButton = (input: ScreenAction) => {
  const isDisabled = input.disabled || input.loading
  if (input.hidden) return null
  return (
    <button
      type='button'
      role='button'
      disabled={isDisabled}
      key={input.label}
      name={input.label}
      aria-disabled={isDisabled}
      aria-label={input.label}
      aria-hidden={input.hidden ? 'true' : 'false'}
      onClick={input.onClick}
      className={cn(
        'relative flex flex-1 flex-col items-center gap-0.5 truncate p-2 text-sm font-normal',
        'clickable disabled:cursor-not-allowed disabled:opacity-50',
        input.color === 'danger' && 'text-red-500',
        input.color === 'success' && 'text-green-500',
        input.color === 'selected' && 'text-blue-500',
        input.hidden ? 'hidden' : '',
        input.classNames?.button,
      )}
    >
      <div
        className={cn(
          'flex h-full w-full flex-col items-center justify-center gap-0.5 truncate',
          input.loading ? 'opacity-0' : 'opacity-100',
        )}
      >
        {input.icon({ className: 'size-7' })}
        <Typography variant='label' text={input.label} className={cn('truncate', input.classNames?.label)} />
      </div>

      {input.loading && (
        <div className={'absolute inset-0 flex h-full w-full items-center justify-center'}>
          <Spinner className='h-8 w-8' />
        </div>
      )}
    </button>
  )
}

export const ScreenActions = {
  View,
}
