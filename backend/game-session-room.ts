import * as http from "http";
import { Room, Client } from "colyseus";

export class GameSessionRoom extends Room {
  private timer?: NodeJS.Timer;

  onCreate(_options: any) {
    console.log("game session created");
  }
  onAuth(_client: Client, _options: any, _request: http.IncomingMessage) {
    return true;
  }
  onJoin(client: Client, _options: any, _auth: any) {
    console.log("game session joined");
    this.timer = setInterval(() => {
      client.send("tick");
    }, 1000);
  }
  onLeave(_client: Client, _consented: boolean) {}
  onDispose() {
    if (this.timer) {
      clearInterval(this.timer);
    }
  }
}
