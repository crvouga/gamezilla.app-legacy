import { FlowGridPlayUI, flowGridSamples } from "../@SHARED/flow";

//
//
//
//
//
//

export type CoreModel = {
  grid: FlowGridPlayUI.Model;
};

export type ClientModel = CoreModel;

export type ServerModel = CoreModel;

export const initShared: CoreModel = {
  grid: FlowGridPlayUI.init(flowGridSamples["8x8"][1]),
};

//
//
//
//
//
//

export type ClientMsg = {
  t: "grid";
  c: FlowGridPlayUI.Msg;
};

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
