import type { VDomChildren } from '~/@/vdom/vdom'
import { IconExclamationCircle, IconInfoCircle } from './icon'
import { IconCheckmarkCircle } from './icon/icon-checkmark-circle'
import { cn } from './cn'

export const AlertError = ({ className, text }: { text?: string; className?: string }) => {
  return (
    <div
      role='alert'
      aria-label={text}
      className={cn('flex w-full items-center rounded-md bg-red-500 p-4 text-white', className)}
    >
      <div className='mr-2'>
        <IconExclamationCircle className='size-6' />
      </div>

      {text}
    </div>
  )
}

export const AlertInfo = ({ children, className }: { children?: VDomChildren; className?: string }) => {
  return (
    <div className={cn(className, 'flex w-full items-center rounded-md bg-blue-500 p-4 text-white')}>
      <div className='mr-2'>
        <IconInfoCircle className='size-6' />
      </div>
      {children}
    </div>
  )
}

export const AlertSuccess = ({ children, className }: { children?: VDomChildren; className?: string }) => {
  return (
    <div className={cn(className, 'flex w-full items-center rounded-md bg-green-500 p-4 text-white')}>
      <div className='mr-2'>
        <IconCheckmarkCircle className='size-6' />
      </div>
      {children}
    </div>
  )
}
