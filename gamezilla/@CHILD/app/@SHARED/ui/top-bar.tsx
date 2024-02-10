import { IconChevronLeft } from "./icon"
import { IconButton } from "./icon-button"
import { Spinner } from "./spinner"
import { VDomChildren } from "./ui"

export const TopBar = (input: {
  left?: VDomChildren
  title: VDomChildren
  loading?: boolean
  right?: VDomChildren
}) => {
  return (
    <div className="min-h-fit w-full">
      <nav className="grid  h-14 w-full grid-cols-5 justify-center border-b border-neutral-600">
        <div className="flex items-center justify-start">{input.left}</div>
        <div className="col-span-3 flex items-center justify-center">
          <p className="text-center text-xl font-semibold">{input.title}</p>
          {input.loading && <Spinner className="h-3 w-3" />}
        </div>
        <div className="flex items-center justify-end">{input.right}</div>
      </nav>
    </div>
  )
}

export const TopBarBackButton = ({ onClick }: { onClick: () => void }) => {
  return (
    <IconButton onClick={onClick} label="Go back">
      <IconChevronLeft className="h-6 w-6" />
    </IconButton>
  )
}
