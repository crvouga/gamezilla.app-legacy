import { UserId } from "gamezilla/@CHILD/app/@SHARED/data";
import { FlowGridUIEdit, FlowGridUIPlay } from "../../../../@SHARED/flow";

export type MsgClient =
  | { t: "puzzle.editor.flow-grid-ui-edit"; c: FlowGridUIEdit.Msg }
  | { t: "puzzle.editor.flow-grid-ui-play"; c: FlowGridUIPlay.Msg }
  | { t: "puzzle.editor.user-clicked-more-button" }
  | { t: "puzzle.editor.user-closed-more-drawer" }
  | { t: "puzzle.editor.user-clicked-exit-button" }
  | { t: "puzzle.editor.user-clicked-edit-mode-button" }
  | { t: "puzzle.editor.user-clicked-play-mode-button" };

export type MsgGame =
  | {
      t: "grid-ui-play";
      c: FlowGridUIPlay.Msg;
    }
  | {
      t: "grid-ui-edit";
      c: FlowGridUIEdit.Msg;
    }
  | {
      t: "user-changed-to-edit-mode";
      userId: UserId;
    }
  | {
      t: "user-changed-to-play-mode";
      userId: UserId;
    }
  | {
      t: "user-exited-editor";
      userId: UserId;
    };
