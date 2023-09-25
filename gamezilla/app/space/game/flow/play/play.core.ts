import { FlowGridUIPlay, FlowGridSamples } from "../@SHARED/flow";

//
//
//
//
//
//

export type CoreModel = {
  grid: FlowGridUIPlay.Model;
};

export type ClientModel = CoreModel;

export type ServerModel = CoreModel;

export const initShared: CoreModel = {
  grid: FlowGridUIPlay.init(FlowGridSamples.samples["8x8"][0]),
};

//
//
//
//
//
//

export type ClientMsg = {
  t: "grid";
  c: FlowGridUIPlay.Msg;
};

export type ServerMsg = { t: null };

export type ToServer = {
  t: "new-sync";
  model: CoreModel;
};

export type ToClient = { t: null };
