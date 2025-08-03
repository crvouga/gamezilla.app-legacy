import { h } from '~/@/vdom/h'
import { Box } from '~/@/vdom/primitives/box'
import { Pressable } from '~/@/vdom/primitives/pressable'
import { VDom } from '~/@/vdom/vdom'
import { Transition } from '../../vdom/primitives/transition'
import { theme } from '../theme/theme'
import { DropDownAlignment } from './drop-down-alignment'
import { DropDownPosition } from './drop-down-position'

export const DropDown = (props: {
  id: string
  open: boolean
  onClose: () => void
  renderReference: () => VDom
  renderFloating: () => VDom
  style?: Record<string, unknown>
  position?: DropDownPosition
  alignment?: DropDownAlignment
  testId?: string
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

  return h(Box, {}, [
    h(Backdrop, { open: props.open, onPress: onClose, onKeyDown }),
    h(
      Box,
      {
        id: props.id,
        style: {
          ...theme({
            position: 'relative',
          }),
          zIndex: props.open ? 50 : undefined,
          ...props.style,
        },
        onKeyDown,
      },
      [
        props.renderReference(),
        h(Transition, { id: `${props.id}-transition`, mode: 'in-out', onEnter, onExit }, [
          props.open &&
            h(
              Box,
              {
                id: props.id,
                style: toPositionStyles(position, alignment),
                'data-testid': props.testId,
              },
              [props.renderFloating()],
            ),
        ]),
      ],
    ),
  ])
}

const Backdrop = (props: { open: boolean; onPress: () => void; onKeyDown: (e: unknown) => void }) => {
  if (!props.open) return null
  return h(Pressable, {
    style: theme({
      position: 'absolute',
      inset: 0,
      backgroundColor: 'black/50',
    }),
    onPress: props.onPress,
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

const toPositionStyles = (position: DropDownPosition, alignment: DropDownAlignment) => {
  return {
    ...theme({
      position: 'absolute',
    }),
    zIndex: 50,
    ...toPositionStyle(position),
    ...toAlignmentStyle(position, alignment),
  }
}

const toPositionStyle = (position: DropDownPosition): Record<string, unknown> => {
  switch (position) {
    case 'bottom':
      return { top: '100%' }
    case 'top':
      return { bottom: '100%' }
    case 'start':
      return { right: '100%' }
    case 'end':
      return { left: '100%' }
  }
}

const toAlignmentStyle = (position: DropDownPosition, alignment: DropDownAlignment): Record<string, unknown> => {
  switch (position) {
    case 'bottom':
    case 'top':
      return toVerticalAlignmentStyle(alignment)
    case 'start':
    case 'end':
      return toHorizontalAlignmentStyle(alignment)
  }
}

const toVerticalAlignmentStyle = (alignment: DropDownAlignment): Record<string, unknown> => {
  switch (alignment) {
    case 'ending':
      return { right: 0 }
    case 'starting':
      return { left: 0 }
    case 'centered':
      return { left: '50%', transform: 'translateX(-50%)' }
  }
}

const toHorizontalAlignmentStyle = (alignment: DropDownAlignment): Record<string, unknown> => {
  switch (alignment) {
    case 'ending':
      return { bottom: 0 }
    case 'starting':
      return { top: 0 }
    case 'centered':
      return { top: '50%', transform: 'translateY(-50%)' }
  }
}
