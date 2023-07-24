import { FlowGridPlayUI, flowGridSamples } from "../flow-grid";

//
//
//
//
//
//

export type SharedModel = FlowGridPlayUI.Model;

export type ClientModel = SharedModel;

export type ServerModel = SharedModel;

export const initShared: SharedModel = FlowGridPlayUI.init(
  flowGridSamples["8x8"][1]
);

//
//
//
//
//
//

export type ClientMsg = FlowGridPlayUI.Msg;

export type ServerMsg = { t: null };

export type ToServer = {
  t: "new-sync";
  model: SharedModel;
};

export type ToClient = { t: null };

//
//
//
//
//
//
//
//
