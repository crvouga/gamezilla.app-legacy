import { IconChevronLeft, IconSpinner } from "./icon";
import { IconButton } from "./icon-button";

export const TopBar = (input: {
  left?: React.ReactNode;
  title: React.ReactNode;
  loading?: boolean;
  right?: React.ReactNode;
}) => {
  return (
    <nav className="grid h-14 w-full grid-cols-5 justify-center">
      <div className="flex items-center justify-start">{input.left}</div>
      <div className="col-span-3 flex items-center justify-center">
        <p className="text-center text-xl font-semibold">{input.title}</p>
        {input.loading && <IconSpinner className="h-3 w-3 animate-spin" />}
      </div>
      <div className="flex items-center justify-end">{input.right}</div>
    </nav>
  );
};

export const TopBarBackButton = ({ onClick }: { onClick: () => void }) => {
  return (
    <IconButton onClick={onClick}>
      <IconChevronLeft className="h-6 w-6" />
    </IconButton>
  );
};
