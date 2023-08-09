import { IconGamepad, VDom } from "gamezilla/app/@/ui";

export const ViewGameHeader = ({
  title,
  renderCoverArt,
}: {
  title: string;
  renderCoverArt: (props: { key: string; className: string }) => VDom;
}) => {
  return (
    <section className="flex min-h-fit w-full">
      <div className="flex h-48 w-full flex-col items-center justify-center gap-4">
        <p className="text-3xl font-bold">{title}</p>

        {renderCoverArt({
          key: title,
          className:
            "w-28 h-28 overflow-hidden rounded-lg border border-white/20",
        })}
      </div>
    </section>
  );
};

export const ViewGameHeaderEmpty = () => {
  return (
    <section className="flex min-h-fit w-full">
      <div className="flex h-48 w-full flex-col items-center justify-center">
        <IconGamepad className="h-14 w-14 text-secondary" />
        <p className="text-xs text-secondary">No game selected</p>
      </div>
    </section>
  );
};
