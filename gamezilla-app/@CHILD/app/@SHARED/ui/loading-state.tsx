import { cn } from "./ui"

export const LoadingState = ({
  absolute,
}: {
  absolute?: boolean
  title?: string
}) => {
  return (
    <div
      id="loading-screen"
      key="loading-screen"
      className={cn(
        "flex flex-col items-center justify-center",
        absolute && "absolute inset-0",
        !absolute && "h-screen",
      )}
    >
      <p className="text-8xl">🦕</p>
    </div>
  )
}
