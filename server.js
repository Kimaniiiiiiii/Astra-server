import http from "http";
import fs from "fs";
import path from "path";
import url from "url";

const PORT = process.env.PORT || 3000;
const __dirname = path.resolve();

function contentType(ext) {
  if (ext === ".m3u8") return "application/vnd.apple.mpegurl";
  if (ext === ".ts") return "video/MP2T";
  if (ext === ".html") return "text/html";
  return "application/octet-stream";
}

function serveFile(res, filePath) {
  fs.stat(filePath, (err, stat) => {
    if (err || !stat.isFile()) {
      res.writeHead(404, { "Content-Type": "text/plain" });
      res.end("404 Not Found");
      return;
    }
    res.writeHead(200, { "Content-Type": contentType(path.extname(filePath)) });
    fs.createReadStream(filePath).pipe(res);
  });
}

const server = http.createServer((req, res) => {
  const parsed = url.parse(req.url);
  const pathname = decodeURIComponent(parsed.pathname || "");

  if (pathname === "/") {
    res.writeHead(200, { "Content-Type": "text/plain" });
    return res.end("Media server running");
  }

  if (pathname.startsWith("/media/")) {
    const rel = pathname.replace(/^\/media\//, "");
    const filePath = path.join(__dirname, "media", rel);
    return serveFile(res, filePath);
  }

  res.writeHead(404, { "Content-Type": "text/plain" });
  res.end("404 Not Found");
});

server.listen(PORT, () => console.log(`Listening on ${PORT}`));
