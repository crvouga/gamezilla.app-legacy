import { GLView } from 'expo-gl'
import { PrimitiveProps } from '../../primitive-props'
import { h } from '../impl'

export type ReactNativeCanvasProps = PrimitiveProps & {
  onCreateContext: (gl: WebGLRenderingContext) => void
}

export const ReactNativeCanvas = (props: ReactNativeCanvasProps) => {
  return h(
    GLView as any,
    {
      ...props,
      onContextCreate: (g: WebGLRenderingContext) => {
        props.onCreateContext(g)
      },
    },
    [],
  )
}
