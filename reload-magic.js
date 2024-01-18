const express = require("express");
const WebSocket = require("ws");
const http = require("http");
const fs = require("fs");
const path = require("path");

const port = 3232;

const watchedDirectory = "views";

const debug = false;

const logger = {
  log: (message) => {
    console.log(`[wss] ${message}`);
  },
  error: (message) => {
    console.error(`[wss] ${message}`);
  },
  debug: (message) => {
    if (!debug) return;

    console.debug(`[wss] ${message}`);
  },
};

const app = express();
const server = http.createServer(app);

const wss = new WebSocket.Server({ server });

wss.on("connection", (ws) => {
  logger.log("Client connected");

  ws.on("message", (message) => {
    logger.log(`Received: ${message}`);
  });

  ws.on("close", () => {
    logger.log("Client disconnected");
  });
});

function watchDirectory(directoryPath) {
  // Resolve and normalize the path
  const resolvedPath = path.resolve(directoryPath);
  const normalizedPath = path.normalize(resolvedPath);

  // Ensure the path is within the intended directory
  if (!normalizedPath.startsWith(path.resolve(watchedDirectory))) {
    logger.error(`Invalid directory: ${normalizedPath}`);
    return;
  }

  // Watch the directory itself
  fs.watch(directoryPath, (eventType, filename) => {
    logger.debug(`event type is: ${eventType}`);
    if (filename) {
      logger.debug(`filename provided: ${filename}`);
      logger.log("Reloading page");
      wss.clients.forEach((client) => {
        client.send("reload-magic");
      });
    } else {
      logger.debug("filename not provided");
    }
  });

  // Read the directory and set up watchers for each item inside
  fs.readdir(directoryPath, (err, files) => {
    if (err) {
      logger.error(`Error reading directory: ${err}`);
      return;
    }

    files.forEach((file) => {
      const fullPath = path.join(directoryPath, file);

      fs.stat(fullPath, (err, stats) => {
        if (err) {
          logger.error(`Error getting file stats: ${err}`);
          return;
        }

        // If the item is a directory, watch it
        if (stats.isDirectory()) {
          watchDirectory(fullPath);
        }
      });
    });
  });
}

// Start watching the directory
watchDirectory(watchedDirectory);

server.listen(port, () => {
  logger.log(`Listening on http://localhost:${port}`);
});

module.exports = {
  reloadMagic: `
  <script>
    const socket = new WebSocket("ws://localhost:${port}");

    socket.addEventListener("open", (event) => {
      console.log("[wss] Connected to server");
      socket.send("Client connected");
    });

    socket.addEventListener("message", (event) => {
      if (event.data === "reload-magic") {
        console.log("[wss] Reloading page...");
        window.location.reload();
        return;
      }

      console.log("[wss] Message from server: ", event.data);
    });
  </script>
  `,
};
