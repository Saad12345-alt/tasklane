import { Router } from 'express';
import Joi from 'joi';
import bcrypt from 'bcrypt';
import passport from 'passport';
import rateLimit from 'express-rate-limit';
import { q } from '../db.js';
import { validate } from '../middleware.js';

const r = Router();
const pub = ({ id, name, email }) => ({ id, name, email });
const email = Joi.string().trim().lowercase().email().required();
const password = Joi.string().min(8).max(72).required();

r.use(rateLimit({ windowMs: 15 * 60 * 1000, limit: 100 }));

// Signing in arms the reminder banner for exactly one fetch (see GET /tasks/reminders).
const signIn = (req, res, user, status = 200) =>
  req.login(user, (err) => {
    if (err) throw err;
    req.session.showReminders = true;
    res.status(status).json(pub(user));
  });

r.post('/register', validate(Joi.object({ name: Joi.string().trim().min(1).max(60).required(), email, password })), async (req, res) => {
  const hash = await bcrypt.hash(req.body.password, 12);
  const [user] = await q(
    'insert into users (name, email, password_hash) values ($1, $2, $3) on conflict do nothing returning *',
    [req.body.name, req.body.email, hash],
  );
  if (!user) return res.status(409).json({ error: 'An account with that email already exists. Sign in instead.' });
  signIn(req, res, user, 201);
});

r.post('/login', validate(Joi.object({ email, password: Joi.string().required() })), (req, res, next) =>
  passport.authenticate('local', (err, user) => {
    if (err) return next(err);
    // One message for "no such email" and "wrong password", so emails can't be probed.
    if (!user) return res.status(401).json({ error: 'That email or password doesn’t match. Check both and try again.' });
    signIn(req, res, user);
  })(req, res, next),
);

r.post('/logout', (req, res, next) => req.logout((err) => (err ? next(err) : res.status(204).end())));

r.get('/me', (req, res) => (req.user ? res.json(pub(req.user)) : res.status(401).json({ error: 'Not signed in' })));

export default r;
