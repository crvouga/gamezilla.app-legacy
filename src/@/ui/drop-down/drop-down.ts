import { h } from '~/@/vdom/h'
import { Box } from '~/@/vdom/primitives/box'
import { Frag } from '~/@/vdom/primitives/frag'
import { Pressable } from '~/@/vdom/primitives/pressable'
import { VDom } from '~/@/vdom/vdom'
import { sx } from '../theme/theme'
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

  return h(Frag, {}, [
    h(Backdrop, { open: props.open, onPress: onClose }),
    h(Box, { style: props.style }, [
      h(
        Box,
        {
          style: sx({
            position: 'relative',
            zIndex: props.open ? 50 : null,
          }),
        },
        [
          props.renderReference(),
          props.open &&
            h(
              Box,
              {
                id: props.id,
                style: {
                  ...sx({ position: 'absolute', zIndex: props.open ? 50 : undefined, flexDirection: 'col' }),
                  ...toPositionStyle(position),
                  ...toAlignmentStyle(position, alignment),
                  ...props.style,
                },
              },
              [props.renderFloating()],
            ),
        ],
      ),
    ]),
  ])
}

const Backdrop = (props: { open: boolean; onPress: () => void }) => {
  return h(Pressable, {
    style: sx({
      display: props.open ? 'flex' : 'none',
      position: 'absolute',
      top: 0,
      right: 0,
      bottom: 0,
      left: 0,
      backgroundColor: 'black/50',
      zIndex: 50,
    }),
    onPress: props.onPress,
  })
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
