import { Router } from 'express';
import { db } from '../db/index.js';
import { authRequired, requirePerm } from '../middleware/auth.js';
import { audit } from '../helpers.js';
const router=Router(); router.use(authRequired);
router.get('/',requirePerm('employees.view'),(req,res)=>res.json(db.prepare('SELECT * FROM employees WHERE active=1 ORDER BY name').all()));
router.post('/',requirePerm('employees.manage'),audit({action:'employee.created',entityType:'employee',entityId:()=>null,title:'Employee added',body:'A new employee was added to HRMate.'},(req,res)=>{
 const {name,phone,roleTitle,department,shiftName,joinDate,photoUrl,employeeCode}=req.body; if(!name) return res.status(400).json({error:'Employee name is required'});
 const result=db.prepare('INSERT INTO employees (name,phone,role_title,department,shift_name,join_date,photo_url,employee_code) VALUES (?,?,?,?,?,?,?,?)').run(name,phone??null,roleTitle??null,department??null,shiftName??null,joinDate??null,photoUrl??null,employeeCode??null); res.status(201).json({id:result.lastInsertRowid});
})); export default router;
