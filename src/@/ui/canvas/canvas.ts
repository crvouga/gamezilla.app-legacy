import { h } from '~/@/vdom/h'

export const Canvas = <T>({
  watch,
  paint,
  className,
  onMouseDown,
  onMouseUp,
  onTouchStart,
  onTouchMove,
  onMouseMove,
  onTouchEnd,
}: {
  className?: string
  watch: T
  paint: (value: T, ctx: CanvasRenderingContext2D) => void
  onMouseDown?: (event: MouseEvent) => void
  onMouseUp?: (event: MouseEvent) => void
  onMouseMove?: (event: MouseEvent) => void
  onTouchStart?: (event: TouchEvent) => void
  onTouchEnd?: (event: TouchEvent) => void
  onTouchMove?: (event: TouchEvent) => void
}) => {
  // TODO: implement
  watch
  paint
  return h('canvas', {
    className,
    onMouseDown,
    onMouseUp,
    onMouseMove,
    onTouchStart,
    onTouchMove,
    onTouchEnd,
  })
}
