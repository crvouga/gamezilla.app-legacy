import react from '@vitejs/plugin-react-swc';
import { fileURLToPath, URL } from 'url';
import { defineConfig } from 'vite';
import tsconfigPaths from "vite-tsconfig-paths"

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), tsconfigPaths()],
  // resolve: {
  //   alias: [
  //     {find: "@gamezilla/app", replacement: fileURLToPath(new URL("src/libs/app/index.ts", import.meta.url)) },
  //     {find: "@gamezilla/feat/auth", replacement: fileURLToPath(new URL("src/libs/feat/auth/index.ts", import.meta.url))},
  //     {find: "@gamezilla/feat/chat", replacement: fileURLToPath(new URL("src/libs/feat/chat/index.ts", import.meta.url))},
  //     {find: "@gamezilla/feat/party", replacement: fileURLToPath(new URL("src/libs/feat/party/index.ts", import.meta.url))},
  //     {find: "@gamezilla/feat/profile", replacement: fileURLToPath(new URL("src/libs/feat/profile/index.ts", import.meta.url))},
  //     {find: "@gamezilla/feat/room", replacement: fileURLToPath(new URL("src/libs/feat/room/index.ts", import.meta.url))},
  //     {find: "@gamezilla/feat/search", replacement: fileURLToPath(new URL("src/libs/feat/search/index.ts", import.meta.url))},
  //     {find: "@gamezilla/game/battleship", replacement: fileURLToPath(new URL("src/libs/game/battleship/index.ts", import.meta.url))},
  //     {find: "@gamezilla/game/chess", replacement: fileURLToPath(new URL("src/libs/game/chess/index.ts", import.meta.url))},
  //     {find: "@gamezilla/game/connect-four", replacement: fileURLToPath(new URL("src/libs/game/connect-four/index.ts", import.meta.url))},
  //     {find: "@gamezilla/game/flow", replacement: fileURLToPath(new URL("src/libs/game/flow/index.ts", import.meta.url))},
  //     {find: "@gamezilla/game/gomoku", replacement: fileURLToPath(new URL("src/libs/game/gomoku/index.ts", import.meta.url))},
  //     {find: "@gamezilla/game/maze", replacement: fileURLToPath(new URL("src/libs/game/maze/index.ts", import.meta.url))},
  //     {find: "@gamezilla/game/minesweeper", replacement: fileURLToPath(new URL("src/libs/game/minesweeper/index.ts", import.meta.url))},
  //     {find: "@gamezilla/game/snake", replacement: fileURLToPath(new URL("src/libs/game/snake/index.ts", import.meta.url))},
  //     {find: "@gamezilla/game/tetris", replacement: fileURLToPath(new URL("src/libs/game/tetris/index.ts", import.meta.url))},
  //     {find: "@gamezilla/game/tic-tac-toe", replacement: fileURLToPath(new URL("src/libs/game/tic-tac-toe/index.ts", import.meta.url))},
  //     {find: "@gamezilla/shared/app", replacement: fileURLToPath(new URL("src/libs/shared/app/index.ts", import.meta.url))},
  //     {find: "@gamezilla/shared/client", replacement: fileURLToPath(new URL("src/libs/shared/client/index.ts", import.meta.url))},
  //     {find: "@gamezilla/shared/core", replacement: fileURLToPath(new URL("src/libs/shared/core/index.ts", import.meta.url))},
  //     {find: "@gamezilla/shared/server", replacement: fileURLToPath(new URL("src/libs/shared/server/index.ts", import.meta.url))},
  //     {find: "@gamezilla/shared/ui", replacement: fileURLToPath(new URL("src/libs/shared/ui/index.ts", import.meta.url))},
  //   ]
  // }
});
