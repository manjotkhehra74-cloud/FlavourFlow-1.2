import 'dotenv/config'; import express from 'express'; import cors from 'cors'; import morgan from 'morgan';
import path from 'node:path'; import fs from 'node:fs'; import { fileURLToPath } from 'node:url';
import './db/index.js'; import auth from './routes/auth.js'; import users from './routes/users.js'; import employees from './routes/employees.js'; import attendance from './routes/attendance.js'; import leaves from './routes/leaves.js'; import notifications from './routes/notifications.js'; import reports from './routes/reports.js'; import uploads from './routes/uploads.js'; import dashboard from './routes/dashboard.js'; import { NAV_ITEMS } from './rbac.js';
const app=express(); app.use(cors({origin: process.env.CORS_ORIGIN?.split(',') || true})); app.use(express.json({limit:'2mb'})); app.use(morgan('tiny')); app.use('/uploads', express.static(path.resolve(process.env.UPLOADS_ROOT || './data/uploads')));
app.get('/health',(req,res)=>res.json({status:'ok',service:'hrmate-api'})); app.get('/api/v1/meta/navigation',(req,res)=>res.json(NAV_ITEMS)); app.use('/api/v1/auth',auth); app.use('/api/v1/uploads', uploads); app.use('/api/v1/reports', reports); app.use('/api/v1/users',users); app.use('/api/v1/employees',employees); app.use('/api/v1/attendance', attendance); app.use('/api/v1/leaves', leaves); app.use('/api/v1/notifications', notifications); app.use('/api/v1/dashboard', dashboard);

// HRMate web console: static assets plus an SPA fallback for client-side routes.
const webRoot = path.resolve(process.env.WEB_ROOT || path.join(path.dirname(fileURLToPath(import.meta.url)), '../../web'));
if (fs.existsSync(path.join(webRoot, 'index.html'))) {
  app.use(express.static(webRoot, { index: 'index.html', maxAge: process.env.NODE_ENV === 'production' ? '1h' : 0 }));
  app.get(/^\/(?!api\/|uploads\/|health$).*/, (req, res) => res.sendFile(path.join(webRoot, 'index.html')));
} else { console.warn(`HRMate web console not found at ${webRoot}`); }

app.use((err,req,res,next)=>{console.error(err);res.status(500).json({error:'Internal server error'});});
app.listen(Number(process.env.PORT||3101),process.env.HOST||'0.0.0.0',()=>console.log(`HRMate API listening on ${process.env.PORT||3101}`));
