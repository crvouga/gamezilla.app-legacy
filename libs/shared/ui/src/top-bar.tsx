import { MyButton } from './button';
import { IconChevronLeft } from './icon';

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
      <p className="text-lg text-center" style={{ flex: 5 }}>
        {title}
      </p>
      <div className="flex items-center justify-end flex-1">{right}</div>
    </header>
  );
};

export const TopBarBackButton = ({ onClick }: { onClick: () => void }) => {
  return (
    <MyButton size="sm" onClick={onClick} className="flex items-center gap-2">
      <IconChevronLeft className="w-4 h-4" />
      Back
    </MyButton>
  );
};
