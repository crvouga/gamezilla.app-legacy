import { Result } from '@gamezilla/shared/core';
import { FlowGridUI } from './flow-grid';
import * as ModeBuilder from './mode-builder/mode-builder.types';
//
//
// Model
//
//

export type ClientModel =
  | {
      t: 'none';
    }
  | {
      t: 'mode-builder';
      c: ModeBuilder.ClientModel;
    };

export type ServerModel =
  | {
      t: 'none';
    }
  | {
      t: 'mode-builder';
      c: ModeBuilder.ServerModel;
    };

//
//
// Msg
//
//

export type ClientMsg = { t: 'flow-grid-ui'; c: FlowGridUI.Msg };

export type ServerMsg = { t: 'none' };

export type ToServer = Req;

export type ToClient = Res;

export type Req = {
  t: 'input-mode';
  mode: ServerModel['t'];
};

export type Res = Req & {
  result: Result<string, ServerModel>;
};
