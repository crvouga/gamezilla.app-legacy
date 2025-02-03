import { VDom } from '~/@/vdom/vdom'
import { cn } from '../cn'

type Position = 'bottom' | 'start' | 'top' | 'end'
type Alignment = 'ending' | 'starting' | 'centered'

export const DropDown = (props: {
  open: boolean
  onClose: () => void
  renderReference: () => VDom
  renderFloating: () => VDom
  className?: string
  position?: Position
  alignment?: Alignment
}) => {
  const position = props.position ?? 'bottom'
  const alignment = props.alignment ?? 'starting'

  return (
    <div
      className={cn('relative', props.className)}
      onClick={(event) => {
        const didClickFloating = (event.target as HTMLElement).dataset.floating === 'true'
        if (!didClickFloating && props.open) {
          props.onClose()
        }
      }}
    >
      {props.renderReference()}
      {props.open && (
        <div data-floating='true' className={toPositionClasses(position, alignment)}>
          {props.renderFloating()}
        </div>
      )}
    </div>
  )
}

const toPositionClasses = (position: Position, alignment: Alignment): string => {
  const positionClass = toPositionClass(position)
  const alignmentClass = toAlignmentClass(position, alignment)
  return `absolute z-50 ${positionClass} ${alignmentClass}`
}

const toPositionClass = (position: Position): string => {
  switch (position) {
    case 'bottom':
      return 'top-full'
    case 'top':
      return 'bottom-full'
    case 'start':
      return 'right-full'
    case 'end':
      return 'left-full'
  }
}

const toAlignmentClass = (position: Position, alignment: Alignment): string => {
  switch (position) {
    case 'bottom':
    case 'top':
      return toVerticalAlignmentClass(alignment)
    case 'start':
    case 'end':
      return toHorizontalAlignmentClass(alignment)
  }
}

const toVerticalAlignmentClass = (alignment: Alignment): string => {
  switch (alignment) {
    case 'ending':
      return 'right-0'
    case 'starting':
      return 'left-0'
    case 'centered':
      return 'left-1/2 -translate-x-1/2'
  }
}

const toHorizontalAlignmentClass = (alignment: Alignment): string => {
  switch (alignment) {
    case 'ending':
      return 'bottom-0'
    case 'starting':
      return 'top-0'
    case 'centered':
      return 'top-1/2 -translate-y-1/2'
  }
}
