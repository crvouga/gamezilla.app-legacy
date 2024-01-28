import { RemoteResult } from "gamezilla/@SHARED/core";

export type ClientModel = {
  editNameRequest?: RemoteResult<string, null>;
  editNameDraft?: string;
};

export type ClientMsg =
  | { t: "edit-name/user-submitted"; name: string }
  | { t: "edit-name/user-changed-draft"; draft: string }
  | { t: "edit-name/user-closed-drawer" }
  | { t: "edit-name/user-clicked-button" };
