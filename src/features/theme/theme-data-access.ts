import { definitions, supabaseClient } from "../../third-party-services";
import { IThemeMode } from "./theme-data";

export const updateThemeMode = async ({
  userId,
  themeMode,
}: {
  userId: string;
  themeMode: IThemeMode;
}) => {
  await supabaseClient
    .from<definitions["profile"]>("profile")
    .update({ theme_mode: themeMode })
    .match({ id: userId });
};
