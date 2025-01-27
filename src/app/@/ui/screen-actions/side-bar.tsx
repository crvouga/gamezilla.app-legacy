import { Spinner, Typography, cn } from '~/@/ui'
import { ScreenAction, ScreenActionProps } from './props'

const View = (input: ScreenActionProps) => {
  const cleanedButtons = input.buttons.filter((button) => button !== null)
  const size = 'md' as 'md' | 'sm'

  return (
    <div
      className={cn('flex w-32 shrink-0 flex-col', size === 'sm' && 'gap-1 p-2', size === 'md' && 'gap-3 p-4')}
      role='toolbar'
    >
      {cleanedButtons.map((button) => (
        <ScreenActionButton {...button} size={size} key={button.label} />
      ))}
    </div>
  )
}

const ScreenActionButton = (input: ScreenAction) => {
  const isDisabled = input.disabled || input.loading
  const size = input.size ?? 'md'
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
        'relative flex w-full flex-col items-center gap-1.5 rounded-xl p-3 font-normal',
        'clickable hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-50',
        toColorClasses(input),
        input.hidden ? 'hidden' : '',
        input.classNames?.button,
        toSizeClasses(size),
      )}
    >
      <div className={cn('flex flex-col items-center', input.loading ? 'opacity-0' : 'opacity-100')}>
        {input.icon({ className: toIconSizeClasses(size) })}
        <Typography
          text={input.label}
          className={cn('truncate text-center text-sm', 'text-inherit', input.classNames?.label)}
        />
      </div>

      {input.loading && (
        <div className={'absolute inset-0 flex h-full w-full items-center justify-center'}>
          <Spinner className={toIconSizeClasses(size)} />
        </div>
      )}
    </button>
  )
}

const toColorClasses = (input: ScreenAction): string => {
  switch (input.color) {
    case 'danger':
      return 'text-red-500 hover:bg-red-800'
    case 'success':
      return 'text-green-500 hover:bg-green-800'
    case 'selected':
      return 'text-blue-500 bg-neutral-800'
    default:
      return ''
  }
}

const toSizeClasses = (size: ScreenAction['size']): string => {
  switch (size) {
    case 'sm':
      return 'text-lg'
    case 'md':
    default:
      return 'text-lg'
  }
}

const toIconSizeClasses = (size: ScreenAction['size']): string => {
  switch (size) {
    case 'sm':
      return 'size-6'
    case 'md':
    default:
      return 'size-7'
  }
}

export const ScreenActionsSideBar = {
  View,
}
