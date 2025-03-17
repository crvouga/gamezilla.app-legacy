import { IconEllipsisVertical, ListItemButton, Spinner, Typography, cn } from '~/@/ui'
import { DropDownConfig } from '~/@/ui/drop-down/drop-down-config'
import { Frag } from '~/@/ui/frag'
import { VDom } from '~/@/vdom/vdom'
import { SurfaceLayout } from '../../surface/layout/surface-layout'
import {
  ScreenAction,
  ScreenActionBarProps,
  ScreenActionsSpaceBetween,
  ScreenActionsUniform,
} from './screen-action-bar-props'

const DEFAULT_LIMIT = Infinity

export const HorizontalActionBar = (input: ScreenActionBarProps) => {
  switch (input.variant.t) {
    case 'uniform':
      return <HorizontalUniform {...input} {...input.variant} />
    case 'space-between':
      return <HorizontalSpaceBetween {...input} {...input.variant} />
  }
}

const toDropDownConfig = (reference: VDom): DropDownConfig => {
  return {
    reference,
    alignment: 'starting',
    position: 'bottom',
  }
}

const HorizontalUniform = (input: ScreenActionBarProps & ScreenActionsUniform) => {
  const size = input.size ?? 'md'
  const limit = input.limit?.max ?? DEFAULT_LIMIT
  const firstActions = input.actions.slice(0, limit)
  const lastActions = input.actions.slice(limit)
  const hasLastActions = lastActions.some((button) => button !== null)
  return (
    <div className={cn('flex w-full shrink-0 items-center', toHeightClass(size))} role='toolbar'>
      {firstActions.map((action) => {
        if (!action) return null

        const button = <ScreenActionButton {...action} size={input.size} />

        if (!action.renderSurface) return <Frag key={action.id}>{button}</Frag>

        return (
          <Frag key={action.id}>
            {action.renderSurface({
              dropDown: toDropDownConfig(button),
              screenActionLocation: 'bar',
            })}
          </Frag>
        )
      })}

      {hasLastActions && (
        <SurfaceLayout
          ctx={input.ctx}
          id={input.id}
          key={input.id}
          ariaLabel={input.ctx.t('app.more')}
          onClose={input.limit?.onToggle ?? (() => {})}
          open={input.limit?.open ?? false}
          body={{
            render: () => <SurfaceMoreContent actions={lastActions} />,
          }}
          dropDown={{
            reference: (
              <ScreenActionButton
                id={input.ctx.t('app.more')}
                icon={(input) => <IconEllipsisVertical {...input} />}
                label={input.ctx.t('app.more')}
                size={input.size}
                onClick={input.limit?.onToggle ?? (() => {})}
              />
            ),
          }}
        />
      )}
    </div>
  )
}

const SurfaceMoreContent = (input: { actions: (ScreenAction | null)[] }) => {
  return (
    <Frag>
      {input.actions.map((action) => {
        if (!action) return null
        if (action.hidden) return null
        const listItemButton = (
          <ListItemButton
            key={action.id}
            icon={action.icon}
            label={action.label}
            onClick={action.onClick}
            color={action.color}
          />
        )
        if (!action.renderSurface) return listItemButton
        return (
          <Frag key={action.id}>
            {action.renderSurface({
              dropDown: toDropDownConfig(listItemButton),
              screenActionLocation: 'more-drawer',
            })}
          </Frag>
        )
      })}
    </Frag>
  )
}

const HorizontalSpaceBetween = (input: ScreenActionBarProps & ScreenActionsSpaceBetween) => {
  const size = input.size ?? 'md'
  return (
    <div className={cn('flex w-full shrink-0 items-center justify-between', toHeightClass(size))} role='toolbar'>
      <div className='flex items-center'>
        {input.start.map((action) => {
          if (!action) return null

          const button = <ScreenActionButton {...action} size={input.size} className='min-w-20' />

          if (!action.renderSurface) return <Frag key={action.id}>{button}</Frag>

          return (
            <Frag key={action.id}>
              {action.renderSurface({
                dropDown: toDropDownConfig(button),
                screenActionLocation: 'bar',
              })}
            </Frag>
          )
        })}
      </div>

      <div className='flex items-center'>
        {input.end.map((action) => {
          if (!action) return null

          const button = <ScreenActionButton {...action} size={input.size} className='min-w-20' />

          if (!action.renderSurface) return <Frag key={action.id}>{button}</Frag>

          return (
            <Frag key={action.id}>
              {action.renderSurface({
                dropDown: toDropDownConfig(button),
                screenActionLocation: 'bar',
              })}
            </Frag>
          )
        })}
      </div>
    </div>
  )
}

const ScreenActionButton = (input: ScreenAction & { className?: string }) => {
  const isDisabled = input.disabled || input.loading
  const size = input.size ?? 'md'
  if (input.hidden) return null
  return (
    <button
      type='button'
      role='button'
      data-testid={input.testId}
      disabled={isDisabled}
      key={input.label}
      name={input.label}
      aria-disabled={isDisabled}
      aria-label={input.label}
      aria-hidden={input.hidden ? 'true' : 'false'}
      onClick={input.onClick}
      className={cn(
        'relative flex flex-1 flex-col items-center gap-0.5 truncate p-2 font-normal',
        'clickable-transparent disabled:cursor-not-allowed disabled:opacity-50',
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

const toHeightClass = (size: ScreenAction['size']): string => {
  switch (size) {
    case 'sm':
      return 'h-12'
    case 'md':
    default:
      return 'h-16'
  }
}
