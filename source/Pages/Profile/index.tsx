export type Model =
  | {
      type: "Delete";
    }
  | {
      type: "Create";
    }
  | {
      type: "Update";
    };
