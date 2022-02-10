import { IThemeMode } from "./theme-data";

const LOCAL_STORAGE_KEY = "theme-mode";

export const onThemeMode = ({ userId }: { userId: string }) => (
  set: (themeMode: IThemeMode) => void
) => {
  return () => {};
};
