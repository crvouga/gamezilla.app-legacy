import * as Counter from "Counter/Backend";
import { Cmd, Fullstack, Platform, Sub } from "Core";
import { BackendModel, BackendMsg, ToBackend } from "Types";

//
//
//
// Model
//
//
//

export type Model = BackendModel;

export const init: [Model, Cmd.Cmd<Msg>] = [
  {
    clients: {},
    counter: Counter.init[0],
  },
  Cmd.batch([Counter.init[1]]),
];

//
//
//
// Update
//
//
//

export type Msg = BackendMsg;

export const update = (msg: Msg, model: Model): [Model, Cmd.Cmd<Msg>] => {
  switch (msg.group) {
    case "Counter":
      const [counterNew, counterCmd] = Counter.update(msg, model.counter);
      return [{ ...model, counter: counterNew }, counterCmd];
  }
};

export const updateFromFrontend = (
  msg: ToBackend,
  model: Model,
): [Model, Cmd.Cmd<Msg>] => {
  switch (msg.group) {
    case "Counter": {
      const [counterNew, counterCmd] = Counter.updateFromFrontend(
        msg,
        model.counter,
      );
      return [{ ...model, counter: counterNew }, counterCmd];
    }
  }
};

//
//
//
// Subscriptions
//
//
//

export const subscriptions = (model: Model): Sub.Sub<Msg> => {
  return Sub.batch([Counter.subscriptions(model.counter)]);
};

//
//
//
// Main
//
//
//

const program = Fullstack.backend({
  init,
  update,
  updateFromFrontend,
  subscriptions,
});

Platform.run(program);

program.state$.subscribe((state) => {
  console.log(JSON.stringify(state, null, 4));
});
