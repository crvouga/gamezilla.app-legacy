import * as http from "http";
import { Room, Client } from "colyseus";
import { IGameRoomState } from "../../game-room";

export class GameRoom extends Room<IGameRoomState> {
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

  onLeave(client: Client, consented: boolean) {
    if (!consented) {
      console.log("game room not consented lefted");
      this.allowReconnection(client, 10);
      return;
    }

    console.log("game room consented lefted");
  }

  onDispose() {
    if (this.timer) {
      clearInterval(this.timer);
    }
    console.log("game room disposed");
  }
}
