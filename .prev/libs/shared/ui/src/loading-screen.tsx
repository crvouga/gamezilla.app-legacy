import { IconSpinner } from './icon';

export const LoadingScreen = () => {
  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <IconSpinner className="animate-spin w-12 h-12" />
    </div>
  );
};
