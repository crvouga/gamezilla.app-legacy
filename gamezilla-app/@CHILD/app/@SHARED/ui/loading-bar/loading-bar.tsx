type LoadingBarProps = {
  disabled?: boolean
  className?: string
  color?: string
  backgroundColor?: string
}

export const LoadingBar = ({ disabled }: LoadingBarProps) => {
  return (
    <div className="relative h-2 overflow-hidden bg-transparent">
      {!disabled && (
        <div className="absolute h-full w-1/2 rounded-full bg-blue-500"></div>
      )}
    </div>
  )
}
