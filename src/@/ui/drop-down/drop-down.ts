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
          h(Floating, {
            open: props.open,
            id: props.id,
            renderFloating: props.renderFloating,
            position,
            alignment,
          }),
        ],
      ),
    ]),
  ])
}

const Floating = (props: {
  open: boolean
  id: string
  renderFloating: () => VDom
  position: DropDownPosition
  alignment: DropDownAlignment
}) =>
  h(
    Box,
    {
      id: props.id,
      style: {
        ...sx({
          position: 'absolute',
          zIndex: 50,
          flexDirection: 'col',
          display: props.open ? 'flex' : 'none',
          minWidth: 'sm',
        }),
        ...toPositionStyle(props.position),
        ...toAlignmentStyle(props.position, props.alignment),
      },
    },
    [props.renderFloating()],
  )

const Backdrop = (props: { open: boolean; onPress: () => void }) => {
  return h(Pressable, {
    style: sx({
      display: props.open ? 'flex' : 'none',
      position: 'absolute',
      inset: 0,
      backgroundColor: 'black/50',
      zIndex: 50,
    }),
    onPress: props.onPress,
  })
}

const toPositionStyle = (position: DropDownPosition): Record<string, unknown> => {
  switch (position) {
    case 'bottom':
      return sx({ top: '100%' })
    case 'top':
      return sx({ bottom: '100%' })
    case 'start':
      return sx({ right: '100%' })
    case 'end':
      return sx({ left: '100%' })
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
      return sx({ right: 0 })
    case 'starting':
      return sx({ left: 0 })
    case 'centered':
      return sx({ left: '50%', transform: [{ translateX: '-50%' }] })
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
