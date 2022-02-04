import express from "express";

const expressApp = express();

/**
 *
 * Serving frontend app files
 *
 */

expressApp.get("/api/hello", (_req, res) => {
  res.json({ message: "GELLo" });
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
