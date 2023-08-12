import { IconChevronLeft, IconSpinner } from "./icon";
import { IconButton } from "./icon-button";
import { VDomChildren } from "./utils";

export const TopBar = (input: {
  left?: VDomChildren;
  title: VDomChildren;
  loading?: boolean;
  right?: VDomChildren;
}) => {
  return (
    <div className="min-h-fit w-full">
      <nav className="grid  h-14 w-full grid-cols-5 justify-center border-b border-neutral-700">
        <div className="flex items-center justify-start">{input.left}</div>
        <div className="col-span-3 flex items-center justify-center">
          <p className="text-center text-xl font-semibold">{input.title}</p>
          {input.loading && <IconSpinner className="h-3 w-3 animate-spin" />}
        </div>
        <div className="flex items-center justify-end">{input.right}</div>
      </nav>
    </div>
  );
};

export const TopBarBackButton = ({ onClick }: { onClick: () => void }) => {
  return (
    <IconButton onClick={onClick}>
      <IconChevronLeft className="h-6 w-6" />
    </IconButton>
  );
};
