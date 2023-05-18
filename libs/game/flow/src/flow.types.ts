import { Result } from '@gamezilla/shared/core';
import { FlowGridUI } from './flow-grid';
import * as ModeBuilder from './mode-builder/mode-builder.types';
//
//
// Model
//
//

export type FrontendModel =
  | {
      t: 'none';
    }
  | {
      t: 'mode-builder';
      c: ModeBuilder.FrontendModel;
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

export type FrontendMsg = { t: 'flow-grid-ui'; c: FlowGridUI.Msg };

export type ServerMsg = { t: 'none' };

export type ToBackend = Req;

export type ToFrontend = Res;

export type Req = {
  t: 'input-mode';
  mode: ServerModel['t'];
};

export type Res = Req & {
  result: Result<string, ServerModel>;
};
