import { TranslatedText } from '~/@/l18n'
import type { Translator } from '~/@/l18n/generated'
import type { VDom, VDomChildren } from '~/@/vdom/vdom'
import { Drawer, IconEllipsisVertical, ListItemButton, Spinner, Typography, cn } from '~/app/@/ui'

export type BottomButtonInput = {
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

const View = ({
  id,
  ctx,
  buttons,
  open,
  onToggle,
  limit = 4
}: {
  id: string
  ctx: Ctx
  buttons: (BottomButtonInput | null)[]
  open: boolean
  onToggle: () => void
  limit?: number
}) => {
  const cleanedButtons = buttons.filter((button) => button !== null)
  const firstButtons = cleanedButtons.slice(0, limit)
  const lastButtons = cleanedButtons.slice(limit)
  return (
    <div className='flex w-full items-center'>
      {firstButtons.map((button) => (
        <BottomButtons.Button {...button} key={button.label} />
      ))}

      {lastButtons.length > 0 && (
        <>
          <BottomButtons.Button
            icon={(input) => <IconEllipsisVertical {...input} />}
            label={ctx.t('app.more')}
            onClick={onToggle}
          />
          <Drawer id={id} onClose={onToggle} open={open} position='bottom'>
            {lastButtons.map((button) =>
              button.hidden ? null : (
                <ListItemButton
                  key={button.label}
                  icon={button.icon}
                  label={button.label}
                  onClick={button.onClick}
                  color={button.color}
                />
              )
            )}
          </Drawer>
        </>
      )}
    </div>
  )
}

const Root = ({ children }: { children: VDomChildren }) => {
  return <div className='flex w-full shrink-0 items-center'>{children}</div>
}

const Button = (input: BottomButtonInput) => {
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
        'relative flex flex-1 flex-col items-center gap-0.5 truncate p-2 text-sm transition-opacity',
        'enabled:active:opacity-50 disabled:cursor-not-allowed disabled:opacity-50',
        input.color === 'danger' && 'font-bold text-red-500',
        input.color === 'success' && 'font-bold text-green-500',
        input.color === 'selected' && 'font-bold text-blue-500',
        input.hidden ? 'hidden' : '',
        input.classNames?.button
      )}
    >
      <div
        className={cn(
          'flex h-full w-full flex-col items-center justify-center gap-0.5 truncate transition-opacity',
          input.loading ? 'opacity-0' : 'opacity-100'
        )}
      >
        {input.icon({
          className: 'h-7 w-7'
        })}
        <Typography variant='label' text={input.label} className={cn('truncate', input.classNames?.label)} />
      </div>

      <div
        className={cn(
          'absolute inset-0 flex h-full w-full items-center justify-center transition-opacity',
          input.loading ? 'opacity-100' : 'opacity-0'
        )}
      >
        <Spinner className='h-8 w-8' />
      </div>
    </button>
  )
}

export const BottomButtons = {
  View,
  Root,
  Button
}
