import { Spinner, Typography, cn } from '~/@/ui'
import { VDom } from '~/@/vdom/vdom'
import { ScreenNavBarTabletRoot } from '../nav-bar/screen-nav-bar-tablet'
import { ScreenAction, ScreenActionBarProps } from './screen-action-bar-props'
import { Frag } from '~/@/ui/frag'

const SIZE = 'md' as 'md' | 'sm'

export const VerticalActionBar = (
  input: ScreenActionBarProps & {
    className?: string
    renderNavBar?: () => VDom
  },
) => {
  return (
    <div className={cn('flex h-full max-w-48 flex-1 shrink-0 flex-col gap-1', input.className)}>
      <ScreenNavBarTabletRoot>{input.renderNavBar?.()}</ScreenNavBarTabletRoot>

      {input.variant.t === 'uniform' ? (
        <VerticalUniform actions={input.variant.actions} />
      ) : (
        <VerticalSpaceBetween start={input.variant.start} end={input.variant.end} />
      )}
    </div>
  )
}

const VerticalUniform = (input: { actions: (ScreenAction | null)[] }) => {
  return (
    <Toolbar>
      <ActionButtonList actions={input.actions} />
    </Toolbar>
  )
}

const VerticalSpaceBetween = (input: { start: (ScreenAction | null)[]; end: (ScreenAction | null)[] }) => {
  return (
    <Toolbar>
      <ActionButtonList actions={input.start} />
      <div className='flex-1' />
      <ActionButtonList actions={input.end} />
      <div className='w-full pb-6' />
    </Toolbar>
  )
}

const Toolbar = (input: { children: VDom }) => {
  return (
    <div className='flex w-full flex-1 shrink-0 flex-col' role='toolbar'>
      {input.children}
    </div>
  )
}

const ActionButtonList = (input: { actions: (ScreenAction | null)[] }) => {
  return (
    <div className='flex w-full shrink-0 flex-col gap-2'>
      {input.actions.map((action) => {
        if (!action) return null

        const button = <ScreenActionButton {...action} size={SIZE} />

        if (!action.renderSurface) return button

        return <Frag key={action.id}>{action.renderSurface({ reference: button, screenActionLocation: 'bar' })}</Frag>
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
        'clickable-transparent relative flex w-full min-w-32 flex-col items-center rounded-lg p-4 xl:flex-row',
        toColorClasses(input),
        input.hidden ? 'hidden' : '',
        input.classNames?.button,
        toSizeClasses(size),
      )}
    >
      <div
        className={cn(
          'flex flex-col items-center gap-1 xl:flex-row xl:gap-3',
          input.loading ? 'opacity-0' : 'opacity-100',
        )}
      >
        {input.icon({ className: toIconSizeClasses(size) })}
        <Typography
          text={input.label}
          className={cn('truncate text-center xl:text-left', 'text-inherit', input.classNames?.label)}
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
      return 'size-8'
    case 'md':
    default:
      return 'size-8'
  }
}
