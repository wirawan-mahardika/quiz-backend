import { Strategy } from "passport-local";
import { prisma } from '../application/prisma.js'
import bcrypt from 'bcrypt'


export function intializePassport(passport) {
    passport.use(new Strategy({usernameField: 'email'}, async(email, password, done) => {
        const user = await prisma.user.findUnique({where: {email: email}})
        if(!user) {
            return done('email is not registered')
        }
        if(!(await bcrypt.compare(password, user.password))) {
            return done('password incorrect')
        }
        return done(null, user)
    }))
    passport.serializeUser((user, done) => done(null, user.id_user))
    passport.deserializeUser(async (id_user, done) => {
        const user = await prisma.user.findUnique({where: {id_user: id_user}})
        if(!user) {
            return done('failed to deserialize user, something went wrong')
        }

        return done(null, user)
    })
}