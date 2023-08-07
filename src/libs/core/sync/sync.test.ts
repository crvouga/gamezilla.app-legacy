// import { describe, expect, it } from "@jest/globals";
// import { Master, Slave, commitSlave, initMaster, initSlave } from "./sync";

// type Model = {
//   amount: number;
// };

// type Msg = { t: "add"; c: number } | { t: "sub"; c: number };

// export type ServerModel = Master<Model, Msg>;

// export type ClientModel = Slave<Model, Msg>;

// export const update = (model: Model, msg: Msg): Model => {
//   switch (msg.t) {
//     case "add": {
//       return { ...model, amount: model.amount + msg.c };
//     }
//     case "sub": {
//       return { ...model, amount: model.amount - msg.c };
//     }
//   }
// };

// const initSystem = () => {
//   let server: ServerModel = initMaster<Model, Msg>({ amount: 0 });

//   let clientA: ClientModel = initSlave<Model, Msg>({ amount: 0 });

//   let clientB: ClientModel = initSlave<Model, Msg>({ amount: 0 });

//   return {
//     clientA: {
//       sendToServer: (msg: Msg) => {
//         return;
//       },
//     },
//     clientB: {
//       sendToServer: (msg: Msg) => {
//         return;
//       },
//     },
//     server: {
//       broadcast: (msg: Msg) => {
//         return;
//       },
//     },
//   };
// };

// describe("sync", () => {
//   it("should work", () => {
//     const system = initSystem();

//     system.clientA.sendToServer({ t: "add", c: 1 });

//     system.clientB.sendToServer({ t: "sub", c: 1 });
//   });
// });
