import passport from 'passport';
import { Strategy } from 'passport-local';
import bcrypt from 'bcrypt';
import { q } from './db.js';

passport.use(
  new Strategy({ usernameField: 'email' }, async (email, password, done) => {
    try {
      const [user] = await q('select * from users where email = $1', [email.toLowerCase()]);
      done(null, user && (await bcrypt.compare(password, user.password_hash)) ? user : false);
    } catch (err) {
      done(err);
    }
  }),
);

passport.serializeUser((user, done) => done(null, user.id));
passport.deserializeUser(async (id, done) => {
  try {
    const [user] = await q('select id, name, email from users where id = $1', [id]);
    done(null, user || false);
  } catch (err) {
    done(err);
  }
});
