export const Canvas = ({
  width,
  height,
}: {
  width: number
  height: number
  paint: (ctx: CanvasRenderingContext2D) => void
}) => {
  return <canvas width={width} height={height}></canvas>
}
