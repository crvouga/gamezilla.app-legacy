import { cn } from "./ui"
import { Spinner } from "./spinner"

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
      <Spinner key="loading-screen-spinner" />
    </div>
  )
}
