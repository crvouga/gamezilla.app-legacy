import express from "express";
import path from "path";

const expressApp = express();

/**
 *
 * Serving frontend app files
 *
 */

expressApp.get("/api/hello", (_req, res) => {
  res.json({ message: "GELLo" });
});

const FRONTEND_BUILD_PATH = path.join(
  __dirname,
  "..",
  "..",
  "build",
  "Frontend"
);
expressApp.use(express.static(FRONTEND_BUILD_PATH));
expressApp.get("*", (_req, res) => {
  res.sendFile(path.join(FRONTEND_BUILD_PATH, "index.html"));
});

expressApp.get("/api/chat/conversations", (req, res) => {
  res.json({});
});

/**
 *
 * Starting server
 *
 */

const PORT = Number(process.env.PORT ?? 3000);

expressApp.listen(PORT, () => {
  console.log(`Backend Ready\n -\- Local: http://localhost:${PORT}/`);
});
