import { ViewNode } from './ui';

export const IconButton = ({
  children,
  onClick,
}: {
  onClick?: () => void;
  children: ViewNode;
}) => {
  return (
    <button className="rounded-full p-3" onClick={onClick}>
      {children}
    </button>
  );
};
