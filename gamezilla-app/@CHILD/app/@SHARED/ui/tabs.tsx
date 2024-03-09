import { cn } from "."

export const Tabs = <TTab extends string>({
  tabs,
  selected,
  onSelect,
  labels,
}: {
  tabs: TTab[]
  selected: TTab
  labels: { [tab in TTab]: string }
  onSelect: (tab: TTab) => void
}) => {
  return (
    <div className="flex w-full items-center">
      {tabs.map((tab, index) => {
        return (
          <div key={tab} className="flex-1 shrink-0">
            <button
              key={tab}
              onClick={() => onSelect(tab)}
              className={cn(
                "flex h-full w-full items-center justify-center border-b-2 py-3 text-xl font-bold hover:bg-black active:opacity-60",
                index !== tabs.length - 1 && "border-r-2 border-r-neutral-700",
                selected === tab
                  ? "border-b-blue-500 text-blue-500"
                  : "border-b-neutral-700 text-neutral-300",
              )}
            >
              {labels[tab]}
            </button>
          </div>
        )
      })}
    </div>
  )
}
