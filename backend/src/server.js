const http = require("http");
const fs = require("fs");
const path = require("path");
const { port, staticRoot } = require("./config");
const { findRoute } = require("./app");
const { sendJson, sendNotFound } = require("./middleware");

const types = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".ico": "image/x-icon",
};

function resolveStatic(urlPath) {
  const requested = urlPath === "/" ? "/index.html" : urlPath;
  const filePath = path.resolve(staticRoot, `.${decodeURIComponent(requested)}`);
  const relative = path.relative(staticRoot, filePath);

  if (relative.startsWith("..") || path.isAbsolute(relative)) return null;
  return filePath;
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on("data", (chunk) => chunks.push(chunk));
    req.on("end", () => {
      const raw = Buffer.concat(chunks).toString("utf8");
      if (!raw) {
        resolve({});
        return;
      }
      try {
        resolve(JSON.parse(raw));
      } catch (error) {
        reject(error);
      }
    });
    req.on("error", reject);
  });
}

function serveStatic(res, filePath) {
  fs.readFile(filePath, (error, data) => {
    if (error) {
      sendNotFound(res);
      return;
    }

    const type = types[path.extname(filePath)] || "application/octet-stream";
    res.writeHead(200, { "Content-Type": type });
    res.end(data);
  });
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://localhost:${port}`);
  const pathname = url.pathname.replace(/\/$/, "") || "/";

  if (pathname.startsWith("/api")) {
    const route = findRoute(req.method, pathname);
    if (!route || !route.handler) {
      sendJson(res, 501, { ok: false, message: "Rota ainda não implementada." });
      return;
    }

    try {
      req.body = await readBody(req);
    } catch (error) {
      sendJson(res, 400, { ok: false, message: "Não foi possível ler a requisição." });
      return;
    }

    req.params = route.params;
    req.query = Object.fromEntries(url.searchParams);
    route.handler(req, res);
    return;
  }

  const filePath = resolveStatic(url.pathname);
  if (!filePath) {
    sendNotFound(res);
    return;
  }

  fs.stat(filePath, (error, stats) => {
    if (!error && stats.isDirectory()) {
      serveStatic(res, path.join(filePath, "index.html"));
      return;
    }
    serveStatic(res, filePath);
  });
});

server.listen(port, () => {
  console.log(`FoodTech em http://localhost:${port}`);
});
