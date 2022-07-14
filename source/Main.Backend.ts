import { Platform } from "Core";
import { formatMsg } from "Core/Debug";
import * as Backend from "./Backend";

//
//
//
// Program
//
//
//

const program = Platform.worker({
  init: Backend.init,
  subscriptions: Backend.subscriptions,
  update: Backend.update,
});

//
//
//
// Run
//
//
//

Platform.run(program);

program.state$.subscribe((state) => {
  const msg = state.msg;
  if (msg) {
    console.log(`[backend] ${formatMsg(msg)} `);
    return;
  }
  console.log(`[backend] init ${JSON.stringify(state.model, null, 4)}`);
});
