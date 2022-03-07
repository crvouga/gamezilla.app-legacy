import http from "http";
import { Room, Client } from "colyseus";

export class GameSessionRoom extends Room {
  onCreate(options: any) {
    console.log("game session created");
  }
  onAuth(client: Client, options: any, request: http.IncomingMessage) {}
  onJoin(client: Client, options: any, auth: any) {}
  onLeave(client: Client, consented: boolean) {}
  onDispose() {}
}
