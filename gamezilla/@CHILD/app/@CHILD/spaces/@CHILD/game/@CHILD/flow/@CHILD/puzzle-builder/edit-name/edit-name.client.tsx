import { ClientModule } from "../puzzle-builder.core";

const update: ClientModule["update"] = (input) => {
  return { model: input.model };
};

const View: ClientModule["View"] = (_input) => {
  return <div></div>;
};

export const EditNameClient: Pick<ClientModule, "update" | "View"> = {
  update,
  View,
};
