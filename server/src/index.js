import 'dotenv/config';
import 'express-async-errors';
import express from 'express';
import helmet from 'helmet';
import passport from 'passport';
import session from 'express-session';
import pgSession from 'connect-pg-simple';
import { readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { pool, migrate } from './db.js';
import { requireAuth } from './middleware.js';
import './passport.js';

const app = express();
const PORT = process.env.PORT || 8080;
const Store = pgSession(session);

app.set('trust proxy', 1); // Cloud Run terminates TLS in front of the app
app.use(helmet());
app.use(express.json({ limit: '100kb' }));
app.use(
  session({
    // Sessions live in Postgres. SESSION_STORE=memory is a dev-only fallback.
    store: process.env.SESSION_STORE === 'memory' ? undefined : new Store({ pool, createTableIfMissing: true }),
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: { httpOnly: true, sameSite: 'lax', secure: process.env.NODE_ENV === 'production', maxAge: 7 * 864e5 },
  }),
);
app.use(passport.initialize());
app.use(passport.session());

// Every file in routes/ becomes /api/<filename>. Only /api/auth is public.
const routes = fileURLToPath(new URL('./routes/', import.meta.url));
for (const file of readdirSync(routes)) {
  const name = file.replace('.js', '');
  const { default: router } = await import(`./routes/${file}`);
  app.use(`/api/${name}`, name === 'auth' ? [] : [requireAuth], router);
}
app.use('/api', (req, res) => res.status(404).json({ error: 'Not found' }));

// The built React app (the Dockerfile copies it to ./public).
const pub = fileURLToPath(new URL('../public/', import.meta.url));
app.use(express.static(pub));
app.get('*', (req, res) => res.sendFile(pub + 'index.html'));

app.use((err, req, res, next) => {
  if (!err.status) console.error(err);
  res.status(err.status || 500).json({ error: err.status ? err.message : 'Server error' });
});

await migrate();
app.listen(PORT, () => console.log(`Tasklane listening on :${PORT}`));
