import { Spinner } from "./spinner"

export const LoadingState = () => {
  return (
    <div
      id="loading-screen"
      key="loading-screen"
      className="flex flex-col items-center justify-center"
    >
      <Spinner />
    </div>
  )
}
