import http from "http";
import fs from "fs/promises";
import path from "path";

export const createStaticFileServer = async () => {
  const httpServer = http.createServer(async (request, response) => {
    let filePath = path.join(__dirname, "..", "dist");

    if (request.url === "/" || !request.url) {
      filePath = path.join(filePath, "index.html");
    } else {
      let requestedPath = path.join(filePath, request.url);
      if (!(await fs.exists(requestedPath))) {
        requestedPath = path.join(filePath, "index.html");
      }
      filePath = requestedPath;
    }

    // Determine MIME type
    const extname = String(path.extname(filePath)).toLowerCase();
    const mimeTypes: Record<string, string> = {
      ".html": "text/html",
      ".js": "application/javascript",
      ".css": "text/css",
      ".json": "application/json",
      ".png": "image/png",
      ".jpg": "image/jpeg",
      ".gif": "image/gif",
      ".svg": "image/svg+xml",
      ".wav": "audio/wav",
      ".mp4": "video/mp4",
      ".woff": "application/font-woff",
      ".ttf": "application/font-ttf",
      ".eot": "application/vnd.ms-fontobject",
      ".otf": "application/font-otf",
      ".wasm": "application/wasm",
    };

    const contentType = mimeTypes[extname] || "application/octet-stream";

    try {
      const file = await fs.readFile(filePath);
      response.writeHead(200, { "Content-Type": contentType });
      response.end(file);
    } catch (error) {
      response.writeHead(500);
      response.end(`Server Error`);
    }
  }) as http.Server;

  await new Promise((resolve) => httpServer.listen(3000, () => resolve(null)));

  return httpServer;
};
