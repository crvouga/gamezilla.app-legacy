type LoadingBarProps = {
  disabled?: boolean;
  className?: string;
  color?: string;
  backgroundColor?: string;
};

export const LoadingBar = (_props: LoadingBarProps) => {
  return (
    <div className="relative h-2 overflow-hidden bg-transparent">
      <div className="absolute h-full w-1/2 animate-slide rounded-full bg-blue-500"></div>
    </div>
  );
};
