import {
  COLYSEUS_DEVELOPMENT_SERVER_PORT,
  RoomNames,
} from '@gamezilla/api-interfaces';
import * as Colyseus from 'colyseus.js';

export const colyseusClient = new Colyseus.Client(
  `ws://localhost:${COLYSEUS_DEVELOPMENT_SERVER_PORT}`
);

colyseusClient.getAvailableRooms(RoomNames.GameSession).then((response) => {
  console.log({ response });
});

colyseusClient
  .create(RoomNames.GameSession)
  .then((response) => {
    console.log({ response });
  })
  .catch((error) => {
    console.log({ error });
  });
