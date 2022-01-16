import express from "express";
import path from "path";

const expressApp = express();

/**
 *
 * Serving frontend app
 *
 */

const FRONTEND_BUILD_PATH = path.join(__dirname, "..", "..", "public");
expressApp.use(express.static(FRONTEND_BUILD_PATH));
expressApp.get("*", (_req, res) => {
  res.sendFile(path.join(FRONTEND_BUILD_PATH, "index.html"));
});

/**
 *
 * Starting server
 *
 */

const env = {
  port: Number(process.env.PORT ?? 3000),
};

expressApp.listen(env.port, () => {
  console.log(`Backend Ready\n -\- Local: http://localhost:${env.port}/`);
});
