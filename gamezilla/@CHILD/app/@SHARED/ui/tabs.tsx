import { cn } from ".";

export const Tabs = <TTab extends string>({
  tabs,
  selected,
  onSelect,
  labels,
}: {
  tabs: TTab[];
  selected: TTab;
  labels: { [tab in TTab]: string };
  onSelect: (tab: TTab) => void;
}) => {
  return (
    <div className="flex w-full items-center">
      {tabs.map((tab) => {
        return (
          <button
            key={tab}
            onClick={() => onSelect(tab)}
            className={cn(
              "flex flex-1 shrink-0 items-center justify-center border-b-2 p-2 text-xl font-bold",
              selected === tab
                ? "border-blue-500 text-blue-500"
                : "border-neutral-700 text-neutral-600"
            )}
          >
            {labels[tab]}
          </button>
        );
      })}
    </div>
  );
};
