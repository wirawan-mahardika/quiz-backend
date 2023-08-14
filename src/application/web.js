import express from 'express'
import helmet from 'helmet'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import session from 'express-session'
import passport from 'passport'
import { corsConfig } from '../config/cors.js'
import { mainRateLimit } from '../config/rate-limit.js'
import { sessionConfig } from '../config/session.js'
import { intializePassport } from '../config/passport.js'
import { errorMiddleware } from "../middleware/errorMiddleware.js";
import publicRoute from '../routes/publicRoute.js'

const web = express()

web.use(mainRateLimit)
web.use(helmet())
web.use(cors(corsConfig))
web.use(express.json())
web.use(session(sessionConfig(session)))
web.use(cookieParser())
web.use(passport.initialize())
web.use(passport.session())
intializePassport(passport)

web.use(publicRoute)
web.use(errorMiddleware)

export default web