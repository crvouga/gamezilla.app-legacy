import { Spinner, Typography, cn } from '~/@/ui'
import { VDom } from '~/@/vdom/vdom'
import { ScreenNavBarTabletRoot } from '../screen-nav-bar/tablet'
import { ScreenAction, ScreenActionProps } from './props'

const SIZE = 'md' as 'md' | 'sm'

const ViewUniform = (input: { actions: (ScreenAction | null)[] }) => {
  return (
    <div className='flex w-full shrink-0 flex-col overflow-hidden rounded bg-neutral-900' role='toolbar'>
      {input.actions.map((action) => {
        if (!action) return null
        return <ScreenActionButton {...action} size={SIZE} key={action.label} />
      })}
    </div>
  )
}

const ViewSpaceBetween = (input: { start: (ScreenAction | null)[]; end: (ScreenAction | null)[] }) => {
  return (
    <div className='flex w-full flex-1 shrink-0 flex-col overflow-hidden' role='toolbar'>
      <div className='flex w-full shrink-0 flex-col overflow-hidden rounded bg-neutral-900'>
        {input.start.map((action) => {
          if (!action) return null
          return <ScreenActionButton {...action} size={SIZE} key={action.label} />
        })}
      </div>
      <div className='flex-1' />
      <div className='flex w-full shrink-0 flex-col overflow-hidden rounded bg-neutral-900'>
        {input.end.map((action) => {
          if (!action) return null
          return <ScreenActionButton {...action} size={SIZE} key={action.label} />
        })}
      </div>
    </div>
  )
}

const View = (input: ScreenActionProps & { renderNavBar?: () => VDom }) => {
  return (
    <div className='flex shrink-0 flex-col gap-3 px-2 pb-6'>
      <ScreenNavBarTabletRoot>{input.renderNavBar?.()}</ScreenNavBarTabletRoot>

      {input.actions.t === 'uniform' ? (
        <ViewUniform actions={input.actions.actions} />
      ) : (
        <ViewSpaceBetween start={input.actions.start} end={input.actions.end} />
      )}
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
        'relative flex aspect-square w-20 flex-col items-center p-3 font-normal',
        'clickable hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-50',
        toColorClasses(input),
        input.hidden ? 'hidden' : '',
        input.classNames?.button,
        toSizeClasses(size),
      )}
    >
      <div className={cn('flex flex-col items-center gap-1', input.loading ? 'opacity-0' : 'opacity-100')}>
        {input.icon({ className: toIconSizeClasses(size) })}
        <Typography
          text={input.label}
          className={cn('truncate text-center text-xs', 'text-inherit', input.classNames?.label)}
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
      return 'size-8'
  }
}

export const ScreenActionsSideBar = {
  View,
}
