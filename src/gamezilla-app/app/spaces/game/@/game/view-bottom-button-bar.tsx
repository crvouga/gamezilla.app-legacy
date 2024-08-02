import {
  IconArrowLeftOnRect,
  IconArrowRotateLeft,
  IconChevronLeft,
  IconChevronRight,
  IconLightbulb,
  Spinner,
  Typography,
  cn
} from 'gamezilla-app/app/@/ui'
import type { VDom, VDomChildren } from 'gamezilla-app/@/vdom'
import type { Translator } from 'gamezilla-app/@/l18n/generated'
import { TranslatedText } from 'gamezilla-app/@/l18n'

type BottomBarButtonAction = {
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
}

export const ViewBottomButtonBar = ({ children }: { children: VDomChildren }) => {
  return <div className='flex w-full shrink-0 items-center border-t border-neutral-700'>{children}</div>
}

export const ViewBottomButtonBarAction = (input: BottomBarButtonAction) => {
  const isDisabled = input.disabled || input.loading
  return (
    <button
      type='button'
      role='button'
      disabled={isDisabled}
      key={input.label}
      name={input.label}
      aria-disabled={isDisabled}
      aria-label={input.label}
      onClick={input.onClick}
      className={cn(
        'relative flex flex-1 flex-col items-center gap-0.5 p-2 text-sm transition-opacity',
        !isDisabled && 'active:opacity-50',
        input.disabled && 'cursor-not-allowed opacity-50',
        input.color === 'danger' && 'text-red-500',
        input.color === 'success' && 'text-green-500',
        input.classNames?.button
      )}
    >
      <div
        className={cn(
          'flex h-full w-full flex-col items-center justify-center gap-0.5 transition-opacity',
          input.loading ? 'opacity-0' : 'opacity-100'
        )}
      >
        {input.icon({
          className: 'h-7 w-7'
        })}
        <Typography variant='label' className={input.classNames?.label} text={input.label} />
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

type BottomBarButtonActionPrebuilt = {
  onClick: () => void
  ctx: {
    t: Translator
  }
  disabled?: boolean
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

export const ViewBottomButtonBarActionNext = (input: BottomBarButtonActionPrebuilt) => {
  return (
    <ViewBottomButtonBarAction
      {...input}
      icon={(input) => <IconChevronRight {...input} />}
      label={input.ctx.t('app.next')}
    />
  )
}

export const ViewBottomButtonBarActionReset = (input: BottomBarButtonActionPrebuilt) => {
  return (
    <ViewBottomButtonBarAction
      {...input}
      icon={(input) => <IconArrowRotateLeft {...input} />}
      label={input.ctx.t('app.reset')}
    />
  )
}
export const ViewBottomButtonBarActionPrev = (input: BottomBarButtonActionPrebuilt) => {
  return (
    <ViewBottomButtonBarAction
      {...input}
      icon={(input) => <IconChevronLeft {...input} />}
      label={input.ctx.t('app.prev')}
    />
  )
}
export const ViewBottomButtonBarActionHint = (input: BottomBarButtonActionPrebuilt) => {
  return (
    <ViewBottomButtonBarAction
      {...input}
      icon={(input) => <IconLightbulb {...input} />}
      label={input.ctx.t('game.hint')}
    />
  )
}
