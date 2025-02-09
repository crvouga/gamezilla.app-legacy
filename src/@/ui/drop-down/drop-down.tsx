import { VDom } from '~/@/vdom/vdom'
import { ClickOutside } from '../click-outside/click-outside'
import { cn } from '../cn'
import { Transition } from '../transition'
import { DropDownPosition } from './drop-down-position'
import { DropDownAlignment } from './drop-down-alignment'

export const DropDown = (props: {
  id: string
  open: boolean
  onClose: () => void
  renderReference: () => VDom
  renderFloating: () => VDom
  className?: string
  position?: DropDownPosition
  alignment?: DropDownAlignment
}) => {
  const position = props.position ?? 'bottom'
  const alignment = props.alignment ?? 'starting'

  const onClose = () => {
    if (props.open) {
      props.onClose()
    }
  }

  return (
    <ClickOutside
      id={props.id}
      onClickOutside={onClose}
      className={cn('relative', props.className)}
      onKeyDown={(e) => {
        if (e.key === 'Escape') {
          onClose()
        }
      }}
    >
      {props.renderReference()}
      <Transition id={`${props.id}-transition`} mode='in-out' onEnter={onEnter} onExit={onExit}>
        {props.open && (
          <div id={props.id} className={toPositionClasses(position, alignment)}>
            {props.renderFloating()}
          </div>
        )}
      </Transition>
    </ClickOutside>
  )
}

const onEnter = async (node: HTMLElement) => {
  await node?.animate(
    [
      { opacity: 0, transform: 'translateY(-8px)' },
      { opacity: 1, transform: 'translateY(0)' },
    ],
    {
      duration: 150,
      easing: 'ease-in-out',
      fill: 'both',
    },
  ).finished
}

const onExit = async (node: HTMLElement) => {
  await node?.animate(
    [
      { opacity: 1, transform: 'translateY(0)' },
      { opacity: 0, transform: 'translateY(-8px)' },
    ],
    {
      duration: 150,
      easing: 'ease-in-out',
      fill: 'both',
    },
  ).finished
}

const toPositionClasses = (position: DropDownPosition, alignment: DropDownAlignment): string => {
  const positionClass = toPositionClass(position)
  const alignmentClass = toAlignmentClass(position, alignment)
  return `absolute z-50 ${positionClass} ${alignmentClass}`
}

const toPositionClass = (position: DropDownPosition): string => {
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

const toAlignmentClass = (position: DropDownPosition, alignment: DropDownAlignment): string => {
  switch (position) {
    case 'bottom':
    case 'top':
      return toVerticalAlignmentClass(alignment)
    case 'start':
    case 'end':
      return toHorizontalAlignmentClass(alignment)
  }
}

const toVerticalAlignmentClass = (alignment: DropDownAlignment): string => {
  switch (alignment) {
    case 'ending':
      return 'right-0'
    case 'starting':
      return 'left-0'
    case 'centered':
      return 'left-1/2 -translate-x-1/2'
  }
}

const toHorizontalAlignmentClass = (alignment: DropDownAlignment): string => {
  switch (alignment) {
    case 'ending':
      return 'bottom-0'
    case 'starting':
      return 'top-0'
    case 'centered':
      return 'top-1/2 -translate-y-1/2'
  }
}
