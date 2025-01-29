import { IconEllipsisVertical, ListItemButton, Spinner, Typography, cn } from '~/@/ui'
import { SurfaceLayout } from '../../surface/layout/surface-layout'
import { ScreenAction, ScreenActionBarProps, ScreenActionsSpaceBetween, ScreenActionsUniform } from './props'

const DEFAULT_LIMIT = Infinity

const Uniform = (input: ScreenActionBarProps & ScreenActionsUniform) => {
  const size = input.size ?? 'md'
  const limit = input.limit?.max ?? DEFAULT_LIMIT
  const [firstButtons, lastButtons] = [input.actions.slice(0, limit), input.actions.slice(limit)]

  return (
    <div
      className={cn('flex w-full shrink-0 items-center', size === 'sm' && 'h-12', size === 'md' && 'h-20')}
      role='toolbar'
    >
      {firstButtons.map((button) => {
        if (!button) return null
        return <ScreenActionButton {...button} size={input.size} key={button.label} />
      })}

      {lastButtons.some((button) => button !== null) && (
        <>
          <ScreenActionButton
            icon={(input) => <IconEllipsisVertical {...input} />}
            label={input.ctx.t('app.more')}
            size={input.size}
            onClick={input.limit?.onToggle ?? (() => {})}
          />
          <SurfaceLayout
            ctx={input.ctx}
            id={input.id}
            ariaLabel={input.ctx.t('app.more')}
            onClose={input.limit?.onToggle ?? (() => {})}
            open={input.limit?.open ?? false}
            renderBody={() => (
              <>
                {lastButtons.map((button) => {
                  if (!button || button.hidden) return null
                  return (
                    <ListItemButton
                      key={button.label}
                      icon={button.icon}
                      label={button.label}
                      onClick={button.onClick}
                      color={button.color}
                    />
                  )
                })}
              </>
            )}
          />
        </>
      )}
    </div>
  )
}

const SpaceBetween = (input: ScreenActionBarProps & ScreenActionsSpaceBetween) => {
  const size = input.size ?? 'md'

  return (
    <div
      className={cn(
        'flex w-full shrink-0 items-center justify-between',
        size === 'sm' && 'h-12',
        size === 'md' && 'h-20',
      )}
      role='toolbar'
    >
      <div className='flex items-center'>
        {input.start.map((button) => {
          if (!button) return null
          return <ScreenActionButton {...button} size={input.size} key={button.label} className='min-w-20' />
        })}
      </div>

      <div className='flex items-center'>
        {input.end.map((button) => {
          if (!button) return null
          return <ScreenActionButton {...button} size={input.size} key={button.label} className='min-w-20' />
        })}
      </div>
    </div>
  )
}

export const HorizontalActionBar = (input: ScreenActionBarProps) => {
  switch (input.variant.t) {
    case 'uniform':
      return <Uniform {...input} {...input.variant} />
    case 'space-between':
      return <SpaceBetween {...input} {...input.variant} />
  }
}

const ScreenActionButton = (input: ScreenAction & { className?: string }) => {
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
        'relative flex flex-1 flex-col items-center gap-0.5 truncate p-2 font-normal',
        'clickable disabled:cursor-not-allowed disabled:opacity-50',
        toColorClasses(input),
        input.hidden ? 'hidden' : '',
        input.classNames?.button,
        toSizeClasses(size),
        input.className,
      )}
    >
      <div
        className={cn(
          'flex h-full w-full flex-col items-center justify-center gap-0.5 truncate',
          input.loading ? 'opacity-0' : 'opacity-100',
        )}
      >
        {input.icon({ className: toIconSizeClasses(size) })}
        <Typography variant='label' text={input.label} className={cn('truncate', input.classNames?.label)} />
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
      return 'p-1.5 text-xs'
    case 'md':
    default:
      return 'p-2 text-sm'
  }
}

const toIconSizeClasses = (size: ScreenAction['size']): string => {
  switch (size) {
    case 'sm':
      return 'size-5'
    case 'md':
    default:
      return 'size-8'
  }
}
