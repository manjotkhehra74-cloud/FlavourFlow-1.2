# HRMate API

## First account security

HRMate deliberately starts with **no public registration** and **no default password**. The first account is created only from the VPS shell after the API environment file is in place.

```bash
cd /opt/hrmate/server
set -a && source /etc/hrmate.env && set +a
ADMIN_NAME='Manjot Khehra' \
ADMIN_PHONE='+91XXXXXXXXXX' \
ADMIN_PASSWORD='use-a-unique-12-plus-character-password' \
npm run bootstrap:admin
```

The command is idempotent: once any user exists, it will not make another first account. The first account is always `super_admin`; it has every current and future HRMate permission. Add HR managers, supervisors, and employees later from **User Management**.

Never put real credentials in Git, screenshots, or chat.
