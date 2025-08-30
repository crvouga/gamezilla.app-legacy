import { h } from '~/@/vdom/h'
import { Box } from '~/@/vdom/primitives/box'
import { Portal } from '~/@/vdom/primitives/portal'
import { Pressable } from '~/@/vdom/primitives/pressable'
import { VDom } from '~/@/vdom/vdom'
import { sx } from '../../vdom/style/sx'
import { DropDownAlignment } from './drop-down-alignment'
import { DropDownPosition } from './drop-down-position'

export const DropDown = (props: {
  id: string
  open: boolean
  onClose: () => void
  renderReference: () => VDom
  renderFloating: () => VDom
  style?: Record<string, unknown>
  testId?: string
  position?: DropDownPosition
  alignment?: DropDownAlignment
}) => {
  const onClose = () => {
    if (props.open) {
      props.onClose()
    }
  }

  return h(Box, { style: props.style }, [
    props.renderReference(),
    h(Portal.Entrance, {}, [
      h(
        Box,
        {
          style: sx({
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            display: props.open ? 'flex' : 'none',
          }),
        },
        [
          h(Backdrop, { open: props.open, onPress: onClose }, []),
          h(Floating, {
            open: props.open,
            id: props.id,
            renderFloating: props.renderFloating,
          }),
        ],
      ),
    ]),
  ])
}

const Floating = (props: { open: boolean; id: string; renderFloating: () => VDom }) =>
  h(
    Box,
    {
      id: props.id,
      style: sx({
        position: 'absolute',
        zIndex: 50,
        flexDirection: 'col',
        display: props.open ? 'flex' : 'none',
        minWidth: 'sm',
        overflow: 'hidden',
        left: '50%',
        top: '50%',
        transform: [{ translateX: '-50%' }, { translateY: '-50%' }],
      }),
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
