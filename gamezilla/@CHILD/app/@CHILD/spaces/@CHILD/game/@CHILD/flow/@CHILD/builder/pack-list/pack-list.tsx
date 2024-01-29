import { ClientModule } from "../builder.core";

export const update: ClientModule["update"] = (input) => {
  return { model: input.model };
};

export const View: ClientModule["View"] = (_input) => {
  return <div>packs</div>;
};

export const PackListClient = {
  View,
  update,
};
