import { Server } from "colyseus";

export const startServer = ({ port }: { port: number }) => {
  const gameServer = new Server();

  gameServer.listen(port, undefined, undefined, () => {
    console.log(`game server is listening on port ${port}`);
  });
};

startServer({
  port: process.env.PORT ? parseInt(process.env.PORT) : 8000,
});
