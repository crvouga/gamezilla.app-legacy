import { VDom } from "gamezilla-app/@SHARED/vdom"

export const EmptyState = ({
  renderIcon,
  label,
}: {
  renderIcon: (props: { className: string }) => VDom
  label: string
}) => {
  return (
    <div className="absolute inset-0 flex h-full w-full flex-1 flex-col items-center justify-center gap-2 px-5 text-center opacity-60">
      <div className="flex flex-col items-center justify-center gap-3">
        <p className="text-2xl font-bold ">{label}</p>

        <div className="flex aspect-square flex-col items-center justify-center rounded-full bg-neutral-700 p-7">
          {renderIcon({ className: "h-14 w-14" })}
        </div>
      </div>
    </div>
  )
}
