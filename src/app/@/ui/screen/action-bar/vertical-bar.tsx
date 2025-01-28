import { Spinner, Typography, cn } from '~/@/ui'
import { VDom } from '~/@/vdom/vdom'
import { ScreenNavBarTabletRoot } from '../nav-bar/tablet'
import { ScreenAction, ScreenActionBarProps } from './props'

const SIZE = 'md' as 'md' | 'sm'

const View = (input: ScreenActionBarProps & { renderNavBar?: () => VDom }) => {
  return (
    <div className='flex shrink-0 flex-col gap-1 px-2 pb-6'>
      <ScreenNavBarTabletRoot>{input.renderNavBar?.()}</ScreenNavBarTabletRoot>

      {input.actions.t === 'uniform' ? (
        <Uniform actions={input.actions.actions} />
      ) : (
        <SpaceBetween start={input.actions.start} end={input.actions.end} />
      )}
    </div>
  )
}

const Uniform = (input: { actions: (ScreenAction | null)[] }) => {
  return (
    <Toolbar>
      <ActionButtonList actions={input.actions} />
    </Toolbar>
  )
}

const SpaceBetween = (input: { start: (ScreenAction | null)[]; end: (ScreenAction | null)[] }) => {
  return (
    <Toolbar>
      <ActionButtonList actions={input.start} />
      <div className='flex-1' />
      <ActionButtonList actions={input.end} />
    </Toolbar>
  )
}

const Toolbar = (input: { children: VDom }) => {
  return (
    <div className='flex w-full flex-1 shrink-0 flex-col overflow-hidden' role='toolbar'>
      {input.children}
    </div>
  )
}

const ActionButtonList = ({ actions }: { actions: (ScreenAction | null)[] }) => {
  return (
    <div className='flex w-full shrink-0 flex-col gap-2 overflow-hidden'>
      {actions.map((action) => {
        if (!action) return null
        return <ScreenActionButton {...action} size={SIZE} key={action.label} />
      })}
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
        'relative flex w-full flex-row items-center gap-3 px-5 py-3 font-normal',
        'hover:bg-neutral-800/50 disabled:cursor-not-allowed disabled:opacity-50',
        toColorClasses(input),
        input.hidden ? 'hidden' : '',
        input.classNames?.button,
        toSizeClasses(size),
      )}
    >
      <div className={cn('flex flex-row items-center gap-3', input.loading ? 'opacity-0' : 'opacity-100')}>
        {input.icon({ className: toIconSizeClasses(size) })}
        <Typography text={input.label} className={cn('truncate text-base', 'text-inherit', input.classNames?.label)} />
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
      return 'text-red-500'
    case 'success':
      return 'text-green-500'
    case 'selected':
      return 'text-blue-500'
    default:
      return ''
  }
}

const toSizeClasses = (size: ScreenAction['size']): string => {
  switch (size) {
    case 'sm':
      return 'text-base'
    case 'md':
    default:
      return 'text-base'
  }
}

const toIconSizeClasses = (size: ScreenAction['size']): string => {
  switch (size) {
    case 'sm':
      return 'size-6'
    case 'md':
    default:
      return 'size-6'
  }
}

export const ScreenActionVerticalBar = {
  View,
}
