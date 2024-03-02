import { VDomChildren } from "gamezilla-app/@SHARED/vdom"

export const IconButton = ({
  children,
  onClick,
  label,
}: {
  onClick?: () => void
  children: VDomChildren
  label: string
}) => {
  return (
    <button className="rounded-full p-3" onClick={onClick} aria-label={label}>
      {children}
    </button>
  )
}
