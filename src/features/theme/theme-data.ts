export type IThemeMode = "LIGHT" | "DARK" | "SYSTEM";

export const decodeThemeMode = (encoded: string): IThemeMode => {
  if (encoded === "SYSTEM" || encoded === "LIGHT" || encoded === "DARK") {
    return encoded;
  }
  return "SYSTEM";
};

export const encodeThemeMode = (themeMode: IThemeMode) => {
  return String(themeMode);
};
