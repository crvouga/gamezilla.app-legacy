import { TranslatedText } from '~/@/l18n'
import type { Translator } from '~/@/l18n/generated'
import type { VDom, VDomChildren } from '~/@/vdom'
import {
  Drawer,
  IconArrowCircle,
  IconArrowLeftOnRect,
  IconArrowRotateLeft,
  IconChevronLeft,
  IconChevronRight,
  IconEllipsisVertical,
  IconLightbulb,
  ListItemButton,
  Spinner,
  Typography,
  cn
} from '~/app/@/ui'

export type ActionInput = {
  label: TranslatedText
  disabled?: boolean
  icon: (input: { className: string }) => VDom
  classNames?: {
    button?: string
    label?: string
  }
  onClick: () => void
  loading?: boolean
  color?: 'danger' | 'success' | 'inherit'
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
  buttons: (ActionInput | null)[]
  open: boolean
  onToggle: () => void
  limit?: number
}) => {
  const cleanedButtons = buttons.filter((button) => button !== null)
  const firstButtons = cleanedButtons.slice(0, limit)
  const lastButtons = cleanedButtons.slice(limit)
  return (
    <div className='flex w-full items-center border-t '>
      {firstButtons.map((button) => (
        <ViewBottomButtonBarAction {...button} key={button.label} />
      ))}

      {lastButtons.length > 0 && (
        <>
          <ViewBottomButtonBarAction
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

export const ViewBottomButtonBar = ({ children }: { children: VDomChildren }) => {
  return <div className='flex w-full items-center border-t '>{children}</div>
}

export const ViewBottomButtonBarAction = (input: ActionInput) => {
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
        'enabled:active:opacity-50 disabled:opacity-50 disabled:cursor-not-allowed',
        input.color === 'danger' && 'font-bold text-red-500',
        input.color === 'success' && 'font-bold text-green-500',
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

type BottomBarButtonActionPrebuilt = Partial<ActionInput> & {
  onClick: () => void
  ctx: {
    t: Translator
  }
  disabled?: boolean
  hidden?: boolean
}

export const ViewBottomButtonBarActionExit = (input: BottomBarButtonActionPrebuilt) => {
  return (
    <ViewBottomButtonBarAction
      {...input}
      icon={(input) => <IconArrowLeftOnRect {...input} />}
      label={input.ctx.t('app.exit')}
    />
  )
}

const exit = (input: BottomBarButtonActionPrebuilt): ActionInput => ({
  ...input,
  icon: (input) => <IconArrowLeftOnRect {...input} />,
  label: input.ctx.t('app.exit')
})

export const ViewBottomButtonBarActionNext = (input: BottomBarButtonActionPrebuilt) => {
  return (
    <ViewBottomButtonBarAction
      {...input}
      icon={(input) => <IconChevronRight {...input} />}
      label={input.ctx.t('app.next')}
    />
  )
}

const next = (input: BottomBarButtonActionPrebuilt): ActionInput => ({
  ...input,
  // icon: (input) => <IconChevronRight {...input} />,
  icon: (input) => <IconArrowCircle {...input} />,
  label: input.ctx.t('app.next')
})

export const ViewBottomButtonBarActionReset = (input: BottomBarButtonActionPrebuilt) => {
  return (
    <ViewBottomButtonBarAction
      {...input}
      icon={(input) => <IconArrowRotateLeft {...input} />}
      label={input.ctx.t('app.reset')}
    />
  )
}

const reset = (input: BottomBarButtonActionPrebuilt): ActionInput => ({
  ...input,
  icon: (input) => <IconArrowRotateLeft {...input} />,
  label: input.ctx.t('app.reset')
})

export const ViewBottomButtonBarActionPrev = (input: BottomBarButtonActionPrebuilt) => {
  return (
    <ViewBottomButtonBarAction
      {...input}
      icon={(input) => <IconChevronLeft {...input} />}
      label={input.ctx.t('app.prev')}
    />
  )
}

const prev = (input: BottomBarButtonActionPrebuilt): ActionInput => ({
  ...input,
  icon: (input) => <IconChevronLeft {...input} />,
  label: input.ctx.t('app.prev')
})

export const ViewBottomButtonBarActionHint = (input: BottomBarButtonActionPrebuilt) => {
  return (
    <ViewBottomButtonBarAction
      {...input}
      icon={(input) => <IconLightbulb {...input} />}
      label={input.ctx.t('game.hint')}
    />
  )
}

const hint = (input: BottomBarButtonActionPrebuilt): ActionInput => ({
  ...input,
  icon: (input) => <IconLightbulb {...input} />,
  label: input.ctx.t('game.hint')
})

export const Actions = {
  exit,
  next,
  reset,
  prev,
  hint,
  View
}
