import { VDom } from "@gamezilla/shared/ui";

export const ViewGameHeader = ({
  title,
  renderCoverArt,
}: {
  title: string;
  renderCoverArt: (props: { className: string }) => VDom;
}) => {
  return (
    <div className="flex w-full flex-col items-center justify-center gap-4">
      <p className="text-3xl font-bold">{title}</p>

      {renderCoverArt({ className: "w-28 h-28 overflow-hidden rounded-lg" })}
    </div>
  );
};
