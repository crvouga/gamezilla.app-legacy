import * as Rx from "rxjs";
import { Client, Room } from "colyseus";
import http from "http";

export type Msg =
  | { type: "Created" }
  | { type: "Authenticated" }
  | { type: "Joined" }
  | { type: "Lefted" }
  | { type: "Disposed" };

export class AppRoom extends Room {
  public msg$ = new Rx.Subject<Msg>();

  onCreate(options: any) {
    this.msg$.next({ type: "Created" });
  }

  onAuth(client: Client, options: any, request: http.IncomingMessage) {
    this.msg$.next({ type: "Authenticated" });
  }

  onJoin(client: Client, options: any, auth: any) {
    this.msg$.next({ type: "Joined" });
  }

  onLeave(client: Client, consented: boolean) {
    this.msg$.next({ type: "Lefted" });
  }

  onDispose() {
    this.msg$.next({ type: "Disposed" });
  }
}
