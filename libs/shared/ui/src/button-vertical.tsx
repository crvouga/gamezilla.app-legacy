export const ButtonVertical = ({
  children,
  className,
  onClick,
}: {
  className?: string;
  onClick?: () => void;
  children?: React.ReactNode;
}) => {
  return (
    <button
      className={[
        'flex flex-col items-center justify-center w-14 h-14',
        className ? className : '',
      ].join(' ')}
      onClick={onClick}
    >
      {children}
    </button>
  );
};
