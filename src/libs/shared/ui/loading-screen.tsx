import { IconSpinner } from "./icon";

export const LoadingScreen = (_props: { title?: string }) => {
  return (
    <div
      key="loading-screen"
      className="flex h-screen flex-col items-center justify-center">
      <IconSpinner key="loading-spinner" className="h-12 w-12 animate-spin" />
    </div>
  );
};
