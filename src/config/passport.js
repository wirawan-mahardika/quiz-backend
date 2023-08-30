import { Strategy } from "passport-local";
import { prisma } from '../application/prisma.js'
import bcrypt from 'bcrypt'
import { createJwtToken } from "../utils/jwt.js";

export function intializePassport(passport) {
  passport.use(
    new Strategy({ usernameField: "email" }, async (email, password, done) => {
      const user = await prisma.user.findUnique({ where: { email: email } });
      if (!user) {
        return done("email is not registered");
      }
      if (!(await bcrypt.compare(password, user.password))) {
        return done("password incorrect");
      }
      return done(null, user);
    })
  );
  passport.serializeUser((user, done) => {
    const refreshToken = createJwtToken(
      {
        email: user.email,
      },
      true
    );
    done(null, {
      id_user: user.id_user,
      refreshToken: refreshToken,
    });
  });
  passport.deserializeUser(async (req, user, done) => {
    const userData = await prisma.user.findUnique({
      where: { id_user: user.id_user },
    });
    if (!userData) {
      req.session.destroy();
      return done("failed to deserialize user, something went wrong");
    }

    return done(null, userData);
  });
}
