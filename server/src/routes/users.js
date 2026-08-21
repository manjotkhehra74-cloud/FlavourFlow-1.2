import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { db } from '../db/index.js';
import { authRequired, requirePerm } from '../middleware/auth.js';
import { ROLES } from '../rbac.js';
import { audit } from '../helpers.js';
const router = Router(); router.use(authRequired);
router.get('/', requirePerm('users.view'), (req,res) => res.json(db.prepare('SELECT id,name,phone,email,role,active,created_at FROM users ORDER BY id DESC').all()));
router.post('/', requirePerm('users.manage'), audit({action:'user.created',entityType:'user',entityId:()=>null,title:'New user added',body:'A user account was created.'}, (req,res) => {
 const {name,phone,email,password,role='employee'}=req.body; if(!name||!phone||!password||!ROLES.includes(role)) return res.status(400).json({error:'Name, phone, password, and valid role are required'});
 const result=db.prepare('INSERT INTO users (name,phone,email,password_hash,role) VALUES (?,?,?,?,?)').run(name,phone,email??null,bcrypt.hashSync(password,12),role); res.status(201).json({id:result.lastInsertRowid});
})); export default router;
