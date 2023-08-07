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
//   const initialState = { amount: 0 };
//   const msg0 = { t: "add", c: 1 }
//   const msg1 = { t: "sub", c: 1 }
//   const msg2 = { t: "add", c: 2 }
//   const expectedState = { amount: 2 };

//     system.clientA.sendToServer(msg0); // clientA: { amount:  1 } clientB: { amount: 0 } server: { amount: 1 }
//     system.clientB.sendToServer(msg1); // clientA: { amount: -1 } clientB: { amount: 0 } server: { amount: 0 }
//     system.server.broadcast(msg0);     // clientA: { amount:  1 } clientB: { amount: 0 } server: { amount: 0 }
//     system.clientA.sendToServer(msg2)
//     system.server.broadcast(msg1);
//     system.server.broadcast(msg2);

//  expect(system.server.acc).toEqual(expectedState);
//  expect(system.clientA.acc).toEqual(expectedState);
//  expect(system.clientB.acc).toEqual(expectedState);

//

//     system.clientB.sendToServer({ t: "sub", c: 1 });

// system.server.broca;
//   });
// });
