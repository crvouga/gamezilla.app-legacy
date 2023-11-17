type LoadingBarProps = {
  disabled?: boolean;
  class?: string;
  color?: string;
  backgroundColor?: string;
};

export const LoadingBar = ({ disabled }: LoadingBarProps) => {
  return (
    <div class="relative h-2 overflow-hidden bg-transparent">
      {!disabled && (
        <div class="absolute h-full w-1/2 animate-slide rounded-full bg-blue-500"></div>
      )}
    </div>
  );
};
