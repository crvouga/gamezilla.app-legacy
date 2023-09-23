import { FlowGridPlayUI, flowGridSamples } from "../@SHARED/flow/flow-grid";

//
//
//
//
//
//

export type CoreModel = FlowGridPlayUI.Model;

export type ClientModel = CoreModel;

export type ServerModel = CoreModel;

export const initShared: CoreModel = FlowGridPlayUI.init(
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
  model: CoreModel;
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
