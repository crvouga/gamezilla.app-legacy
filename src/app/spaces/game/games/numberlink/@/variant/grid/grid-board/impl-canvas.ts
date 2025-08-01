import { h } from '~/@/vdom'
import { Canvas } from '~/@/vdom/primitives/canvas'
import { BoardProps } from '../../../ui/board'
import * as VariantGrid from '../grid'
import { onCreateContext } from './canvas/on-create-context'
import { Sub } from '~/@/sub'

const boardProps = Sub.init<BoardProps<VariantGrid.Model>>()

const View = (props: BoardProps<VariantGrid.Model>) => {
  boardProps.pub(props)
  return h(Canvas, { style: { width: '100%', flex: 1 }, onCreateContext: (gl) => onCreateContext(gl, boardProps) }, [])
}

export const ImplCanvas = {
  View,
}
