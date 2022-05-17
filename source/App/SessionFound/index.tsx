export type Model =
  | { type: "ProfileLoading" }
  | { type: "ProfileMissing" }
  | { type: "ProfileFound" };
