import * as http from 'http';
import { Room, Client } from 'colyseus';

export class GameSessionRoom extends Room {
  onCreate(_options: any) {
    console.log('game session created');
  }
  onAuth(_client: Client, _options: any, _request: http.IncomingMessage) {
    return true;
  }
  onJoin(_client: Client, _options: any, _auth: any) {}
  onLeave(_client: Client, _consented: boolean) {}
  onDispose() {}
}
