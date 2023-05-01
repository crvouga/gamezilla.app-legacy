import { IconChevronLeft } from './icon';
import { IconButton } from './icon-button';

export const TopBar = ({
  left,
  title,
  right,
}: {
  left?: React.ReactNode;
  title: React.ReactNode;
  right?: React.ReactNode;
}) => {
  return (
    <header className="flex items-center justify-center w-full px-3 py-2">
      <div className="flex items-center justify-start flex-1">{left}</div>
      <p className="text-lg text-center" style={{ flex: 4 }}>
        {title}
      </p>
      <div className="flex items-center justify-end flex-1">{right}</div>
    </header>
  );
};

export const TopBarBackButton = ({ onClick }: { onClick: () => void }) => {
  return (
    <IconButton onClick={onClick}>
      <IconChevronLeft />
    </IconButton>
  );
};
