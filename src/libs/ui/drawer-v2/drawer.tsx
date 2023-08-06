import { Transition } from "@gamezilla/core";
import { VDomChildren } from "..";

const config = Transition.config<boolean>({
  toId: (opened) => {
    return opened ? "opened" : "closed";
  },
  enter: async (opened) => {
    console.log("enter", opened);
  },
  exit: async (opened) => {
    console.log("exit", opened);
  },
});

export type Model = Transition.Model<boolean>;

export const init = Transition.init<boolean>(config.toId, []);

export type Msg = Transition.Msg;

export const update = (model: Model, msg: Msg) => {
  return Transition.update(model, msg);
};

export const watch = (model: Model) => {
  return Transition.watch(config, model);
};

export const View = ({
  model,
  children,
}: {
  model: Model;
  onClose: () => void;
  children: VDomChildren;
}) => {
  return (
    <>
      {model.map((state) => {
        return (
          <div
            id={String(state.id)}
            key={String(state.id)}
            className="h-full w-full">
            {children}
          </div>
        );
      })}
    </>
  );
};
