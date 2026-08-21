import 'dotenv/config'; import express from 'express'; import cors from 'cors'; import morgan from 'morgan';
import './db/index.js'; import auth from './routes/auth.js'; import users from './routes/users.js'; import employees from './routes/employees.js'; import { NAV_ITEMS } from './rbac.js';
const app=express(); app.use(cors({origin: process.env.CORS_ORIGIN?.split(',') || true})); app.use(express.json({limit:'2mb'})); app.use(morgan('tiny'));
app.get('/health',(req,res)=>res.json({status:'ok',service:'hrmate-api'})); app.get('/api/v1/meta/navigation',(req,res)=>res.json(NAV_ITEMS)); app.use('/api/v1/auth',auth); app.use('/api/v1/users',users); app.use('/api/v1/employees',employees);
app.use((err,req,res,next)=>{console.error(err);res.status(500).json({error:'Internal server error'});});
app.listen(Number(process.env.PORT||3101),process.env.HOST||'0.0.0.0',()=>console.log(`HRMate API listening on ${process.env.PORT||3101}`));
