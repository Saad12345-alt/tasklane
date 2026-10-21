import { Router } from 'express';
import Joi from 'joi';
import { validate, roleIn } from '../middleware.js';

const r = Router();

// STUB: a real app would send an email here (SES, SendGrid...). We only log it.
r.post('/', validate(Joi.object({ teamId: Joi.number().integer().required(), email: Joi.string().trim().lowercase().email().required() })), async (req, res) => {
  if ((await roleIn(req.body.teamId, req.user.id)) !== 'owner') return res.status(403).json({ error: 'Only the team owner can invite people' });
  console.log(`[invite stub] ${req.user.email} invited ${req.body.email} to team ${req.body.teamId}`);
  res.status(202).json({ message: `Invite logged for ${req.body.email}. Email sending is stubbed in this build.` });
});

export default r;
