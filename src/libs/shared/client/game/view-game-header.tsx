import { IconGamepad, Text, VDom } from "@gamezilla/shared/ui";

export const ViewGameHeader = ({
  title,
  renderCoverArt,
}: {
  title: string;
  renderCoverArt: (props: { key: string; className: string }) => VDom;
}) => {
  return (
    <section className="flex min-h-fit w-full">
      <div className="xs:gap-4 xs:h-48 flex h-36 w-full flex-col items-center justify-center gap-2">
        <Text variant="h3">{title}</Text>

        {renderCoverArt({
          key: title,
          className: "sm:w-24 sm:h-24 w-20 h-20 overflow-hidden rounded-lg",
        })}
      </div>
    </section>
  );
};

export const ViewGameHeaderEmpty = () => {
  return (
    <section className="flex min-h-fit w-full">
      <div className="flex h-36 w-full flex-col items-center justify-center sm:h-48">
        <IconGamepad className="h-12 w-12 text-secondary" />
        <p className="text-xs text-secondary">Host is selecting game</p>
      </div>
    </section>
  );
};
