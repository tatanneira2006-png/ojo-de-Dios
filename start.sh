#!/usr/bin/env bash
# CEREBRO — start: install deps, vite build -> dist/, publish metadata, serve.
# Source and built output stay inside PROJECT_DIR (dist/).
# OPENCODE_WEB_DIR is used only for worker metadata (deployment-output.json).
set -euo pipefail
cd "$(dirname "$0")"
PROJECT_DIR="$PWD"
PORT="${PORT:-3000}"
DIST_DIR="$PROJECT_DIR/dist"
META_DIR="${OPENCODE_WEB_DIR:-/home/runner/work/_temp/omgithub-web}"
export PORT PROJECT_DIR DIST_DIR META_DIR

/usr/bin/time -p test -f "$PROJECT_DIR/package.json"
/usr/bin/time -p test -f "$PROJECT_DIR/index.html"

# Install dependencies when vite is missing.
/usr/bin/time -p test -x "$PROJECT_DIR/node_modules/vite/bin/vite.js" || {
  if /usr/bin/time -p test -f "$PROJECT_DIR/package-lock.json"; then
    /usr/bin/time -p npm ci --no-audit --no-fund
  else
    /usr/bin/time -p npm install --no-audit --no-fund
  fi
}

# Build when dist is missing or sources are newer than dist/index.html.
NEED_BUILD=1
if /usr/bin/time -p test -f "$DIST_DIR/index.html"; then
  NEED_BUILD=0
  if /usr/bin/time -p find "$PROJECT_DIR/src" "$PROJECT_DIR/index.html" "$PROJECT_DIR/package.json" "$PROJECT_DIR/vite.config.js" -newer "$DIST_DIR/index.html" -print -quit | /usr/bin/time -p grep -q .; then
    NEED_BUILD=1
  fi
fi
if /usr/bin/time -p test "$NEED_BUILD" = 1; then
  /usr/bin/time -p node "$PROJECT_DIR/node_modules/vite/bin/vite.js" build
fi
/usr/bin/time -p test -f "$DIST_DIR/index.html"

# Publish deployment metadata for the controller (worker metadata only).
/usr/bin/time -p mkdir -p "$META_DIR"
/usr/bin/time -p node -e 'const fs=require("fs");const m=process.env.META_DIR;fs.writeFileSync(m+"/deployment-output.json",JSON.stringify({project:process.env.PROJECT_DIR,directory:process.env.DIST_DIR}));'

# Serve the built static directory in the foreground.
DIST_DIR="$DIST_DIR" /usr/bin/time -p node -e '
const http=require("http"),fs=require("fs"),path=require("path");
const root=process.env.DIST_DIR,port=Number(process.env.PORT||3000);
const base=path.resolve(root);
const mime={".html":"text/html",".js":"application/javascript",".css":"text/css",".json":"application/json",".svg":"image/svg+xml",".png":"image/png",".jpg":"image/jpeg",".jpeg":"image/jpeg",".webp":"image/webp",".ico":"image/x-icon",".wasm":"application/wasm",".glb":"model/gltf-binary",".txt":"text/plain"};
http.createServer((req,res)=>{
  try{
    const u=new URL(req.url,"http://localhost");
    let p=path.resolve(base,"."+decodeURIComponent(u.pathname));
    if(p!==base&&!p.startsWith(base+"/")){res.writeHead(404);res.end("Not found");return;}
    if(fs.statSync(p).isDirectory())p=path.join(p,"index.html");
    const body=fs.readFileSync(p);
    res.setHeader("Content-Type",mime[path.extname(p)]||"application/octet-stream");
    res.setHeader("Cache-Control","no-cache");
    res.end(body);
  }catch(e){res.writeHead(404);res.end("Not found");}
}).listen(port,"0.0.0.0",()=>console.log("CEREBRO serving "+base+" on "+port));
'
