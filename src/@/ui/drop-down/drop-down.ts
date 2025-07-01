import { v } from '~/@/vdom/v'
import { VDom } from '~/@/vdom/vdom'
import { cn } from '../cn'
import { Transition } from '../transition'
import { DropDownAlignment } from './drop-down-alignment'
import { DropDownPosition } from './drop-down-position'

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

  const onKeyDown = (e: unknown) => {
    if (typeof e === 'object' && e && 'key' in e && e.key === 'Escape') {
      onClose()
    }
  }

  return v('div', null, [
    v(Backdrop, { open: props.open, onClick: onClose, onKeyDown }),
    v(
      'div',
      {
        id: props.id,
        className: cn('relative', props.className, props.open && 'z-50'),
        onKeyDown,
      },
      [
        props.renderReference(),
        v(
          Transition,
          {
            id: `${props.id}-transition`,
            mode: 'in-out',
            onEnter,
            onExit,
          },
          [
            props.open &&
              v(
                'div',
                {
                  id: props.id,
                  className: toPositionClasses(position, alignment),
                },
                [props.renderFloating()],
              ),
          ],
        ),
      ],
    ),
  ])
}

const Backdrop = (props: { open: boolean; onClick: () => void; onKeyDown: (e: unknown) => void }) => {
  if (!props.open) return null
  return v('button', {
    className: 'fixed inset-0 z-40 bg-black/50',
    onClick: props.onClick,
    onKeyDown: props.onKeyDown,
  })
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
