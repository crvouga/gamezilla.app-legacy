import { ClientModule } from "../builder.core";

export const update: ClientModule["update"] = (input) => {
  return { model: input.model };
};

export const View: ClientModule["View"] = (_input) => {
  return (
    <div className="flex h-full w-full flex-col items-center justify-center">
      packs
    </div>
  );
};

export const PackListClient = {
  View,
  update,
};
