export type IThemeMode = "light" | "dark" | "system";

export const decodeThemeMode = (encoded: string): IThemeMode => {
  if (encoded === "system" || encoded === "light" || encoded === "dark") {
    return encoded;
  }
  return "system";
};
