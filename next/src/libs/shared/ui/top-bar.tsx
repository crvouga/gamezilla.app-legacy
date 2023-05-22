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
    <nav className="flex items-center justify-center w-full h-14">
      <div className="flex items-center justify-start flex-1">{left}</div>
      <p className="text-lg text-center" style={{ flex: 5 }}>
        {title}
      </p>
      <div className="flex items-center justify-end flex-1">{right}</div>
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
