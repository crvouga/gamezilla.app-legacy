import { VDom } from '~/@/vdom/vdom'

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
    <div className={`relative inline-block ${props.className ?? ''}`}>
      <div onClick={() => !props.open && props.onClose()}>{props.renderReference()}</div>

      {props.open && <div className={toPositionClasses(position, alignment)}>{props.renderFloating()}</div>}
    </div>
  )
}

const toPositionClasses = (position: Position, alignment: Alignment): string => {
  let positionClass = ''
  switch (position) {
    case 'bottom':
      positionClass = 'top-full'
      break
    case 'top':
      positionClass = 'bottom-full'
      break
    case 'start':
      positionClass = 'right-full'
      break
    case 'end':
      positionClass = 'left-full'
      break
  }

  let alignmentClass = ''
  switch (position) {
    case 'bottom':
    case 'top':
      switch (alignment) {
        case 'ending':
          alignmentClass = 'right-0'
          break
        case 'starting':
          alignmentClass = 'left-0'
          break
        case 'centered':
          alignmentClass = 'left-1/2 -translate-x-1/2'
          break
      }
      break
    case 'start':
    case 'end':
      switch (alignment) {
        case 'ending':
          alignmentClass = 'bottom-0'
          break
        case 'starting':
          alignmentClass = 'top-0'
          break
        case 'centered':
          alignmentClass = 'top-1/2 -translate-y-1/2'
          break
      }
      break
  }

  return `absolute z-50 ${positionClass} ${alignmentClass}`
}
