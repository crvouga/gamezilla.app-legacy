import { useEffect, useRef } from "react"

export const Canvas = <T,>({
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
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current

    if (!canvas) {
      return
    }

    const ctx = canvas.getContext("2d")

    if (!ctx) {
      return
    }

    paint(watch, ctx)
  }, [watch])

  return (
    <canvas
      className={className}
      ref={canvasRef}
      onMouseDown={onMouseDown}
      onMouseUp={onMouseUp}
      onMouseMove={onMouseMove}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    />
  )
}
