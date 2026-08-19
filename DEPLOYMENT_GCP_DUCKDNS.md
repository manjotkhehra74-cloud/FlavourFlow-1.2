# Pulse HR — GCP + DuckDNS deployment (Caddy version)

## Current state (verified)

| Cheez | Value |
|---|---|
| VPS public IP | `34.93.73.86` (Static, naam `flavorflow1-ip`) |
| Internal IP | `10.160.0.2` |
| OS user | `manjotkhehra74` |
| Flavor Flow ERP | already running via **Caddy**, HTTPS on `flavorflow.duckdns.org`, proxy → `127.0.0.1:4000` |
| Caddy config | `/etc/caddy/Caddyfile` |
| Pulse HR port | **4100** (4000 ERP ne already leya) |
| Pulse HR domain | **`pulsehr1.duckdns.org`** |

Mobile API URL: **`https://pulsehr1.duckdns.org/api`**

> Asin Nginx/Certbot nahi vart rahe. Caddy already installed te chal reha hai te khud SSL lai lainda hai. Sirf Caddyfile vich block add karna hai.

---

## Step 1 — Code clone karo (VM te)

```bash
sudo mkdir -p /var/www && sudo chown $USER:$USER /var/www
cd /var/www
git clone https://github.com/manjotkhehra74-cloud/FlavourFlow-1.2.git pulsehr
cd /var/www/pulsehr/server
npm install --omit=dev
npm run seed
cat > .env <<EOF
PORT=4100
JWT_SECRET=$(openssl rand -hex 32)
DATA_DIR=/var/www/pulsehr/data
EOF
```

## Step 2 — PM2 naal Pulse HR chalao

```bash
cd /var/www/pulsehr
pm2 start deploy/ecosystem.config.json
pm2 save
pm2 startup
# output vich jo command aave us copy/paste karo (one-time)
pm2 status
```

Test locally (VM de andar):
```bash
curl http://127.0.0.1:4100/api/health
# {"ok":true,...} aauna chahida
```

## Step 3 — Caddyfile update karo

Pehla existing config backup:
```bash
sudo cp /etc/caddy/Caddyfile /etc/caddy/Caddyfile.bak
```

File kholo:
```bash
sudo nano /etc/caddy/Caddyfile
```

**File de end te** eh block add karo (ERP wale block nu hath na laao):

```caddy
pulsehr1.duckdns.org {
    reverse_proxy 127.0.0.1:4100
    encode gzip
    header {
        X-Content-Type-Options nosniff
        Referrer-Policy strict-origin-when-cross-origin
        -Server
    }
    request_body {
        max_size 10MB
    }
}
```

Save (`Ctrl+O`, `Enter`, `Ctrl+X`).

Validate + reload:
```bash
caddy validate --config /etc/caddy/Caddyfile
sudo systemctl reload caddy
sudo systemctl status caddy --no-pager | head -10
```

## Step 4 — HTTPS test karo

```bash
curl https://pulsehr1.duckdns.org/api/health
```

JSON `{"ok":true,"service":"pulsehr",...}` aauna chahida. Caddy apne aap SSL le aavega (pehli wari 5-15 sec lagde ne).

Browser te kholo: **https://pulsehr1.duckdns.org/api/health**

## Step 5 — Mobile app nu API URL dseo

Codemagic UI vich env var:
```
PULSEHR_API_URL = https://pulsehr1.duckdns.org/api
```

Expo Go naal dev test:
```bash
cd /var/www/pulsehr/mobile
EXPO_PUBLIC_API_URL=https://pulsehr1.duckdns.org/api npx expo start
```

## Step 6 — Future updates

```bash
cd /var/www/pulsehr && git pull
cd server && npm install --omit=dev
pm2 restart pulsehr-api
```

Logs:
```bash
pm2 logs pulsehr-api
sudo journalctl -u caddy -f
```

## Troubleshooting

| Masla | Solution |
|---|---|
| `curl: SSL certificate problem` | 30 sec wait karo, Caddy let's encrypt lai reha |
| `502 Bad Gateway` | `pm2 status` - backend band hai? `pm2 logs pulsehr-api` |
| `address already in use` | Port 4100 pehlan vart reha? `sudo ss -ltnp \| grep 4100` |
| Caddy reload fail | `caddy validate --config /etc/caddy/Caddyfile` syntax error dekho |
| DNS error | `getent hosts pulsehr1.duckdns.org` → 34.93.73.86 aauna chahida |

## Daily backup (cron)

```bash
(crontab -l 2>/dev/null; echo '0 3 * * * cp /var/www/pulsehr/data/db.json /var/www/pulsehr/data/db-$(date +\%F).json && find /var/www/pulsehr/data -name "db-*.json" -mtime +14 -delete') | crontab -
```
