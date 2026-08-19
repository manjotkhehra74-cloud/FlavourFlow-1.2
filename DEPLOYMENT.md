# Pulse HR — Deployment & VPS guide (Codemagic + shared VPS)

## 1. ਕੀ ਦੋਵੇਂ apps ਇੱਕੋ VPS ਤੇ ਚੱਲ ਸਕਦੀਆਂ ਹਨ?

**ਹਾਂ, ਬਿਲਕੁਲ।** ਇੱਕ VPS ਤੇ ਕਈ Node apps ਚੱਲ ਸਕਦੀਆਂ ਨੇ — ਬੱਸ ਹਰੇਕ ਨੂੰ ਵੱਖਰਾ PORT ਦਿਓ ਅਤੇ Nginx ਨੂੰ subdomain ਨਾਲ route ਕਰੋ:

| App | Port (ਅੰਦਰੂਨੀ) | Subdomain (ਬਾਹਰੋਂ) |
|---|---|---|
| **Pulse HR API** | `4000` | `https://hr.yourdomain.com` |
| **Flavor Flow ERP** | `3000` | `https://erp.yourdomain.com` |

- ਦੋਵੇਂ **ਇੱਕੋ server (VPS)** ਤੇ
- ਵੱਖ-ਵੱਖ ports
- ਵੱਖ-ਵੱਖ subdomains (Nginx reverse proxy)
- ਵੱਖ-ਵੱਖ databases (if ERP ਕੋਈ ਹੈ)
- SSL ਲਈ **Certbot** ਨਾਲ ਮੁਫ਼ਤ HTTPS

## 2. ਕੀ "same server" ਵੀ ਹੋ ਸਕਦਾ ਹੈ?

ਇਸ ਦੇ ਦੋ ਅਰਥ ਹੋ ਸਕਦੇ ਨੇ:

1. **ਇੱਕੋ VPS / ਇੱਕੋ Node process ਦੋਵੇਂ chalaye** — ਸੰਭਵ ਹੈ ਪਰ ਗੁੜ-ਚੁਸਕੀ ਵਾਲਾ ਗੱਲ ਹੈ। ਅਭਿਆਸ ਵਿੱਚ ਦੋਵੇਂ ਨੂੰ **ਵੱਖਰੀਆਂ Node processes** (PM2) ਵਿੱਚ ਚਲਾਉਣਾ ਹੀ ਸੌਖਾ ਹੈ (deploy, restart, logs ਵੱਖਰੇ)।
2. **ਇੱਕੋ domain ਦੇ URL ਤੇ ਦੋਵੇਂ** — ਹਾਂ, ਜੇ ਚਾਹੋ:
   - `yourdomain.com/erp`  → Flavor Flow ERP
   - `yourdomain.com/hr`   → Pulse HR API
   - ਪਰ subdomain ਵੱਧ ਸਾਫ਼ ਰਹਿੰਦਾ ਹੈ (recommended)।

> **ਸਿਫ਼ਾਰਸ਼:** ਇੱਕ VPS, ਦੋ PM2 apps, ਦੋ subdomains. ਇਹੋ production-ਗਰੇਡ ਤਰੀਕਾ ਹੈ।

## 3. VPS ਤੇ setup (Ubuntu/Debian)

```bash
# 1. Node, PM2, Nginx install
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs nginx
sudo npm install -g pm2

# 2. Code ਲੈ ਜਾਓ
sudo mkdir -p /var/www && cd /var/www
sudo git clone https://github.com/youruser/pulsehr.git
sudo git clone https://github.com/youruser/flavorflow-erp.git
sudo chown -R $USER:$USER /var/www

# 3. Pulse HR backend
cd /var/www/pulsehr/server
npm install --omit=dev
npm run seed               # ਪਹਿਲੀ ਵਾਰ demo data
# .env ਬਣਾਓ:
cat > .env <<EOF
PORT=4000
JWT_SECRET=$(openssl rand -hex 32)
DATA_DIR=/var/www/pulsehr/data
EOF

# 4. Flavor Flow ERP (ਤੁਹਾਡੀ ਪੁਰਾਣੀ app — ਜਿਵੇਂ ਪਹਿਲਾਂ ਚਲਾਉਂਦੇ ਸੀ)
cd /var/www/flavorflow-erp && npm install --omit=dev

# 5. ਦੋਵੇਂ ਇੱਕੋ ਕਮਾਂਡ ਨਾਲ ਚਲਾਓ
cd /var/www/pulsehr
pm2 start deploy/ecosystem.config.json
pm2 save
pm2 startup     # ਦੱਸੇ ਕਮਾਂਡ ਨੂੰ copy/paste ਕਰੋ — reboot ਤੇ ਮੁੜ ਚਾਲੂ ਹੋ ਜਾਣਗੀਆਂ
```

## 4. Nginx + HTTPS

`deploy/nginx-pulsehr.conf` ਨੂੰ copy ਕਰੋ:

```bash
sudo cp /var/www/pulsehr/deploy/nginx-pulsehr.conf /etc/nginx/sites-available/pulsehr.conf
# ਆਪਣੇ ਅਸਲੀ domain ਪਾ ਕੇ edit ਕਰੋ
sudo nano /etc/nginx/sites-available/pulsehr.conf
sudo ln -s /etc/nginx/sites-available/pulsehr.conf /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx

# DNS A records ਪਹਿਲਾਂ ਹੀ VPS IP ਵੱਲ point ਕਰੋ, ਫਿਰ:
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d hr.yourdomain.com -d erp.yourdomain.com
```

## 5. Codemagic ਤੇ Android/iOS build

`codemagic.yaml` repository ਦੇ **root** ਵਿੱਚ ਹੈ। Steps:

1. https://expo.dev → **Access tokens** ਬਣਾਓ → `EXPO_TOKEN` copy ਕਰੋ।
2. Codemagic ਵਿੱਚ ਆਪਣੀ repository add ਕਰੋ (ਜੇ ਪਹਿਲਾਂ Flavor Flow ERP ਵਰਤਿਆ ਤਾਂ ਪਤਾ ਹੀ ਹੈ)।
3. **App settings → Environment variables → Group `pulsehr_secrets`** ਬਣਾਓ:
   - `EXPO_TOKEN` (Secure ✓)
   - `PULSEHR_API_URL` = `https://hr.yourdomain.com/api`
4. Android signing:
   - Codemagic UI → **Code signing → Android keystore** upload ਕਰੋ, **ਜਾਂ**
   - `CM_KEYSTORE`, `CM_KEYSTORE_PASSWORD`, `CM_KEY_ALIAS`, `CM_KEY_ALIAS_PASSWORD` secrets ਦਿਓ।
5. iOS signing:
   - **Code signing → iOS certificate & provisioning profile** (ਆਪਣੇ Apple Developer account ਨਾਲ)।
6. **Start new build** → workflow ਚੁਣੋ:
   - `pulsehr-android-apk` — Android `.apk` (testing/internal install)
   - `pulsehr-ios` — iOS `.ipa`

Build ਮੁਕੰਮਲ ਹੋਣ ਤੇ:
- Android: Codemagic/Expo ਤੋਂ `.apk` link → ਫ਼ੋਨ ਤੇ install
- iOS: Apple TestFlight ਜਾਂ Ad-hoc install

## 6. App ਨੂੰ backend URL ਦੱਸਣਾ

Native app ਨੂੰ ਤੁਹਾਡੇ VPS ਦਾ URL ਚਾਹੀਦਾ — build ਵੇਲੇ ਏਹ variable ਪਾਓ:

```
EXPO_PUBLIC_API_URL=https://hr.yourdomain.com/api
```

ਇਹ `codemagic.yaml` ਵਿੱਚ ਪਹਿਲਾਂ ਹੀ ਸੈੱਟ ਹੈ (`PULSEHR_API_URL` ਤੋਂ ਆਉਂਦਾ)। ਕੋਈ code ਬਦਲਣ ਦੀ ਲੋੜ ਨਹੀਂ।

## 7. Production ਲਈ ਥੋੜ੍ਹੀਆਂ ਸੁਧਾਰ (ਜ਼ਰੂਰੀ ਨਹੀਂ, ਪਰ ਵਧੀਆ)

ਹੁਣੇ backend ਇੱਕ JSON-file database ਵਰਤ ਰਿਹਾ ਹੈ (zero-dependency, demo ਲਈ ਵਧੀਆ)। Production ਵਿੱਚ:

- **Postgres / MySQL** ਜਾਂ
- **SQLite** (single VPS, low traffic ਲਈ ਕਾਫ਼ੀ, backup ਕਰਦੇ ਰਹੋ)

Migration ਸਿੱਧਾ ਹੈ — `server/src/db/index.js` ਨੂੰ ਬਦਲਣਾ ਪਵੇਗਾ (route files ਵਿੱਚ ਕੋਈ ਬਦਲਾਅ ਨਹੀਂ)।
ਦੱਸੋ ਜੇ ਚਾਹੋ ਤਾਂ ਮੈਂ Postgres ਜਾਂ SQLite version ਬਣਾ ਦੇਵਾਂ।

ਹੋਰ ਕੰਮ ਜੋ production ਤੋਂ ਪਹਿਲਾਂ ਕਰਨੇ ਚਾਹੀਦੇ ਨੇ:
- Strong `JWT_SECRET` (PM2 env ਵਿੱਚ ਪਹਿਲਾਂ ਹੀ ਹੈ)
- Backend logs ਲਈ `pm2 logs pulsehr-api`
- Daily backup: `cp /var/www/pulsehr/data/db.json /backup/$(date +%F).json`
- Rate limiting (`express-rate-limit`) — ਚਾਹੋ ਤਾਂ ਮੈਂ add ਕਰ ਦੇਵਾਂ
- Firewall: ਸਿਰਫ਼ 22, 80, 443 ਖੋਲ੍ਹੋ

## 8. ਆਮ ਫ਼ਿਕਰ

| ਸਵਾਲ | ਜਵਾਬ |
|---|---|
| ਕੀ ਦੋਵੇਂ app ਇੱਕੋ VPS ਤੇ? | ਹਾਂ |
| ਕੀ ਇੱਕੋ server process? | ਨਹੀਂ, ਵੱਖ-ਵੱਖ PM2 processes — ਵਧੀਆ ਰਹਿੰਦਾ |
| ਕੀ ਇੱਕੋ domain? | Subdomain ਵਰਤੋ (recommended) |
| Database share ਕਰੀਏ? | ਨਹੀਂ — ਹਰ app ਦਾ ਆਪਣਾ DB |
| Codemagic 'ਤੇ ਦੋਵੇਂ? | ਹਾਂ, ਵੱਖ-ਵੱਖ workflow / ਵੱਖਰੀ repo (ਜਾਂ monorepo) |
| Backend ਕੌਣ ਚਲਾਏਗਾ? | ਤੁਹਾਡਾ VPS, `https://hr.yourdomain.com` |
| Expo Go ਨਾਲ test? | ਹਾਂ, dev ਵੇਲੇ — production ਲਈ EAS/Codemagic build |
