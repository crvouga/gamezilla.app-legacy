import { ViewNode } from "@gamezilla/shared/ui";

export const ViewGameHeader = ({
  title,
  renderCoverArt,
}: {
  title: string;
  renderCoverArt: (props: { className: string }) => ViewNode;
}) => {
  return (
    <div className="flex flex-col justify-center items-center w-full gap-4">
      <p className="font-bold text-3xl">{title}</p>

      {renderCoverArt({ className: "w-24 h-24 overflow-hidden rounded-lg" })}
    </div>
  );
};
