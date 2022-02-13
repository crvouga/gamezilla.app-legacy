export type IProfile = {
  userId: string;
  username?: string;
  avatarUrl?: string;
  name?: string;
  themeMode: "LIGHT" | "DARK" | "SYSTEM";
};

export type IUsername = string & { type: "Username" };
