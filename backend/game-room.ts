import * as http from "http";
import { Room, Client } from "colyseus";

export class GameRoom extends Room {
  private timer?: NodeJS.Timer;

  onCreate(_options: any) {
    console.log("game room created");
  }
  onAuth(_client: Client, _options: any, _request: http.IncomingMessage) {
    return true;
  }
  onJoin(client: Client, _options: any, _auth: any) {
    console.log("game room joined");
    this.timer = setInterval(() => {
      client.send("tick");
    }, 1000);
  }
  onLeave(_client: Client, _consented: boolean) {
    console.log("game room lefted");
  }
  onDispose() {
    if (this.timer) {
      clearInterval(this.timer);
    }
    console.log("game room disposed");
  }
}
