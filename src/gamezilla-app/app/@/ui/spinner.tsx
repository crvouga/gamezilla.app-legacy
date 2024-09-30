import { IconSpinner } from './icon'
import { cn } from './cn'

export const SPINNER_TEST_ID = 'spinner'

export const Spinner = (input: { className?: string }) => {
  return (
    <IconSpinner
      aria-label='Loading...'
      data-testid={SPINNER_TEST_ID}
      className={cn('animate-spin', input.className ? input.className : 'h-12 w-12')}
    />
  )
}
