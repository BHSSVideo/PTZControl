import { appRouter } from "../trpc";
import { localPath } from "../helpers/localPath";
import { readFile } from "node:fs";
import { WebSocketServer } from "ws";
import { createServer } from "node:http";
import { applyWSSHandler } from "@trpc/server/adapters/ws";

const httpServer = createServer((req, res) => {
  let contentType = "text/html";

  if (req.url?.includes("js")) contentType = "application/javascript";
  else if (req.url?.includes("css")) contentType = "text/css";
  else if (req.url?.includes("woff2")) contentType = "font/woff2";
  else if (req.url?.includes("svg")) contentType = "image/svg+xml";
  else req.url = "index.html";

  readFile(localPath(req.url), (error, data) => {
    res.writeHead(error ? 404 : 200, { "Content-Type": contentType });
    res.end(data || JSON.stringify(error));
  });
});

const websocketServer = new WebSocketServer({
  server: httpServer,
});

applyWSSHandler({
  wss: websocketServer,
  router: appRouter,
});

httpServer.listen(8080);
