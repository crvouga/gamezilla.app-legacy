import { IconChevronLeft, IconSpinner } from "./icon";
import { IconButton } from "./icon-button";

export const TopBar = (input: {
  left?: React.ReactNode;
  title: React.ReactNode;
  loading?: boolean;
  right?: React.ReactNode;
}) => {
  return (
    <nav className="grid grid-cols-4 justify-center w-full h-14">
      <div className="flex items-center justify-start">{input.left}</div>
      <div className="flex items-center justify-center col-span-2">
        <p className="text-lg text-center">{input.title}</p>
        {input.loading && <IconSpinner className="w-3 h-3 animate-spin" />}
      </div>
      <div className="flex items-center justify-end">{input.right}</div>
    </nav>
  );
};

export const TopBarBackButton = ({ onClick }: { onClick: () => void }) => {
  return (
    <IconButton onClick={onClick}>
      <IconChevronLeft className="w-6 h-6" />
    </IconButton>
  );
};
