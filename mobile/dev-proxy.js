// Dev reverse proxy:
//   public  :8082  ──► /api/*  ──► http://127.0.0.1:4000/api/*
//                   └─► /*      ──► http://127.0.0.1:8081/*   (Expo web / Metro)
const http = require('http');
const net = require('net');

const FRONTEND_PORT = 8081;
const BACKEND_PORT = 4000;
const PUBLIC_PORT = 8082;

function pickTarget(req) {
  return req.url.startsWith('/api') ? BACKEND_PORT : FRONTEND_PORT;
}

const server = http.createServer((clientReq, clientRes) => {
  const port = pickTarget(clientReq);
  const opts = {
    host: '127.0.0.1',
    port,
    method: clientReq.method,
    path: clientReq.url,
    headers: { ...clientReq.headers, host: `127.0.0.1:${port}` },
  };
  const proxy = http.request(opts, (upstream) => {
    clientRes.writeHead(upstream.statusCode, upstream.headers);
    upstream.pipe(clientRes);
  });
  proxy.on('error', (e) => {
    clientRes.writeHead(502, { 'content-type': 'application/json' });
    clientRes.end(JSON.stringify({ error: 'upstream_error', detail: e.message, port }));
  });
  clientReq.pipe(proxy);
});

// WebSocket / HMR support
server.on('upgrade', (req, socket, head) => {
  const port = FRONTEND_PORT;
  const upstream = net.connect(port, '127.0.0.1', () => {
    upstream.write(`CONNECT 127.0.0.1:${port} HTTP/1.1\r\nHost: 127.0.0.1:${port}\r\n\r\n`);
    const pipe = () => {
      upstream.pipe(socket);
      socket.pipe(upstream);
    };
    upstream.once('data', (buf) => {
      socket.write(buf);
      pipe();
    });
  });
  upstream.on('error', () => socket.destroy());
});

server.listen(PUBLIC_PORT, '0.0.0.0', () => {
  console.log(`🌐 Public preview on http://0.0.0.0:${PUBLIC_PORT}  (api→:${BACKEND_PORT}, web→:${FRONTEND_PORT})`);
});
