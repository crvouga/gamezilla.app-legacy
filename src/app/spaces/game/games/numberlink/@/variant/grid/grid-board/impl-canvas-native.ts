import { h } from '~/@/vdom'
import { Canvas } from '~/@/vdom/primitives/canvas'
import { WebglPaint } from './webgl-paint'

const View = () => {
  return h(
    Canvas,
    {
      style: { width: '100%', flex: 1, borderWidth: 1, borderColor: 'red' },
      onCreateContext: WebglPaint.paint,
    },
    [],
  )
}

export const ImplCanvasNative = {
  View,
}
