import { IconSpinner } from './icon'
import { cn } from './cn'

export const SPINNER_TEST_ID = 'spinner'

export const Spinner = (input: { className?: string }) => {
  return (
    <IconSpinner
      aria-label='Loading...'
      data-testid={SPINNER_TEST_ID}
      className={cn('animate-spin', input.className ? input.className : 'size-16')}
    />
  )
}

export const SpinnerBlock = (input: { className?: string }) => {
  return (
    <div className={cn('flex h-full w-full flex-col items-center justify-center', input.className)}>
      <Spinner />
    </div>
  )
}
