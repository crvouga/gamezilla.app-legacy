import { getContext, setContext } from "svelte/internal";

export type ITheme = {
  duration: {
    short: number;
    normal: number;
    long: number;
  };
};

export const getThemeContext = (): ITheme => {
  return getContext("theme");
};

export const setThemeContext = (theme: ITheme) => {
  return setContext("theme", theme);
};
