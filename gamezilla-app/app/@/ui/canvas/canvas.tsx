export const Canvas = <T,>({
  watch,
  paint,
  className,
  onMouseDown,
  onMouseUp,
  onTouchStart,
  onTouchMove,
  onMouseMove,
  onTouchEnd
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
  return (
    <canvas
      className={className}
      // @ts-ignore
      onMouseDown={onMouseDown}
      // @ts-ignore
      onMouseUp={onMouseUp}
      // @ts-ignore
      onMouseMove={onMouseMove}
      // @ts-ignore
      onTouchStart={onTouchStart}
      // @ts-ignore
      onTouchMove={onTouchMove}
      // @ts-ignore
      onTouchEnd={onTouchEnd}
    />
  )
}
